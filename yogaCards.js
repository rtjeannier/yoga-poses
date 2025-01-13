class YogaCard {
    constructor(poseName, activationCost) {
        this.poseName = poseName;
        this.activationCost = activationCost;
        this.categories = [];
        this.transitions = {};
        this.chakraType = '';
        this.activatedEffect = '';
        this.discardEffect = '';
        this.width = 175;
        this.height = 300;
        
        // Position categories with their colors - Adjusted y positions
        this.categoryColors = {
            inversion: { color: '#8F00FF', y: 70 },  // Purple
            standing: { color: '#228B22', y: 110 },   // Forest Green
            kneeling: { color: '#DAA520', y: 150 },  // Goldenrod
            seated: { color: '#CD853F', y: 190 },    // Peru
            supine: { color: '#4169E1', y: 230 },    // Royal Blue
            prone: { color: '#B22222', y: 270 }      // Firebrick
        };

        // Chakra colors and effects
        this.chakraStyles = {
            root: { color: '#ff6b6b', opacity: 0.1 },
            sacral: { color: '#ffd93d', opacity: 0.1 },
            solar: { color: '#6c757d', opacity: 0.1 },
            heart: { color: '#95d5b2', opacity: 0.1 },
            throat: { color: '#8ecae6', opacity: 0.1 },
            thirdEye: { color: '#7209b7', opacity: 0.1 },
            crown: { color: '#9b5de5', opacity: 0.1 }
        };
    }

    setCategories(categories) {
        this.categories = categories.split('|').map(c => c.trim());
    }

    setTransitions(transitions) {
        this.transitions = transitions;
    }

    setChakraType(chakraType) {
        this.chakraType = chakraType.toLowerCase();
    }

    setEffects(activatedEffect, discardEffect) {
        this.activatedEffect = activatedEffect;
        this.discardEffect = discardEffect;
    }

    // Helper function to wrap text within bounds
    wrapText(text, width) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            if (currentLine.length + words[i].length + 1 <= width) {
                currentLine += ' ' + words[i];
            } else {
                lines.push(currentLine);
                currentLine = words[i];
            }
        }
        lines.push(currentLine);
        return lines;
    }
    generateSVG() {
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.width} ${this.height}">
            <!-- Card background -->
            <rect width="${this.width}" height="${this.height}" fill="white" stroke="black" stroke-width="2"/>
            
            <!-- Chakra background -->
            <rect width="${this.width}" height="${this.height}" 
                fill="${this.chakraStyles[this.chakraType]?.color || '#ffffff'}" 
                fill-opacity="${this.chakraStyles[this.chakraType]?.opacity || 0.1}"/>
            
            <!-- Activation Cost -->
            <circle cx="25" cy="25" r="15" fill="white" stroke="#333" stroke-width="1.5"/>
            <text x="25" y="29" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold">${this.activationCost}</text>
            
            <!-- Pose name - adjusted to avoid energy cost -->
            <text x="100" y="30" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold"
                transform="translate(0,0)">${this.poseName}</text>`;
   
        // Add current position indicators (left side)
        this.categories.forEach(category => {
            const catData = this.categoryColors[category];
            if (catData) {
                svg += `<rect x="0" y="${catData.y}" width="20" height="30" fill="${catData.color}"/>`;
            }
        });

        // Add transitions (right side)
        Object.entries(this.categoryColors).forEach(([category, data]) => {
            const transitionValue = this.transitions[category];
            
            if (transitionValue) {
                // Always draw the color rectangle if there's a transition
                svg += `<rect x="${this.width - 20}" y="${data.y}" width="20" height="30" fill="${data.color}"/>`;
                
                // Only add circle and number if value is not zero
                if (transitionValue !== '0') {
                    // Format number: ensure positive numbers have a + sign
                    const formattedValue = parseInt(transitionValue) > 0 ? 
                        `+${parseInt(transitionValue)}` : transitionValue;
                        
                    svg += `
                        <circle cx="${this.width - 10}" cy="${data.y + 20}" r="10" fill="white" stroke="${data.color}"/>
                        <text x="${this.width - 10}" y="${data.y + 24}" 
                            text-anchor="middle" font-family="Arial" fill="${data.color}" font-size="12">
                            ${formattedValue}
                        </text>`;
                }
            }
        });

        // Add effect boxes with text wrapping
        const activatedLines = this.wrapText(this.activatedEffect, 20);
        svg += `
            <g>
                <rect x="25" y="160" width="125" height="70" fill="#f8f8f8" stroke="#ccc" rx="5"/>
                <text x="${this.width/2}" y="175" text-anchor="middle" font-family="Arial" font-size="12">Activate:</text>`;
        
        activatedLines.forEach((line, index) => {
            svg += `<text x="${this.width/2}" y="${190 + (index * 15)}" text-anchor="middle" 
                font-family="Arial" font-size="11">${line}</text>`;
        });
        
        svg += `</g>
            
            <text x="${this.width/2}" y="245" text-anchor="middle" font-family="Arial" font-size="14">- or -</text>
            
            <rect x="25" y="255" width="125" height="25" fill="#f8f8f8" stroke="#ccc" rx="5"/>
            <text x="${this.width/2}" y="272" text-anchor="middle" font-family="Arial" font-size="11">Discard: ${this.discardEffect}</text>
        </svg>`;

        return svg;
    }
}

// Function to parse CSV data
function parseCSVData(csvText) {
    const lines = csvText.split(/\r?\n/);
    const headers = lines[0].split(',');
    const cards = [];

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        const values = lines[i].split(',');
        
        const cardData = {
            name: values[0].trim(),
            categories: values[1].trim(),
            activationCost: parseInt(values[2]),
            chakraType: values[3].trim(),
            transitions: {
                inversion: values[4].trim(),
                standing: values[5].trim(),
                kneeling: values[6].trim(),
                seated: values[7].trim(),
                supine: values[8].trim(),
                prone: values[9].trim()
            },
            activatedEffect: values[10].trim(),
            discardEffect: values[11].trim()
        };
        
        const card = new YogaCard(cardData.name, cardData.activationCost);
        card.setCategories(cardData.categories);
        card.setChakraType(cardData.chakraType);
        card.setTransitions(cardData.transitions);
        card.setEffects(cardData.activatedEffect, cardData.discardEffect);
        
        cards.push(card);
    }

    return cards;
}

// Load and display cards
window.onload = function() {
    const cardsContainer = document.getElementById('cards');
    const GOOGLE_SHEETS_URL = 'fail';
    const LOCAL_CSV_PATH = 'data/default-poses.csv';
    
    function displayCards(csvText) {
        const cards = parseCSVData(csvText);
        cardsContainer.innerHTML = ''; // Clear any error messages
        
        cards.forEach(card => {
            const div = document.createElement('div');
            div.className = 'card';
            div.innerHTML = card.generateSVG();
            cardsContainer.appendChild(div);
        });
    }

    // Try Google Sheets first, fall back to local if it fails
    fetch(GOOGLE_SHEETS_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(csvText => {
            displayCards(csvText);
        })
        .catch(error => {
            console.warn('Failed to load from Google Sheets, using local data:', error);
            // Try to load local CSV file
            fetch(LOCAL_CSV_PATH)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to load local CSV');
                    }
                    return response.text();
                })
                .then(csvText => {
                    displayCards(csvText);
                })
                .catch(localError => {
                    console.error('Failed to load both remote and local data:', localError);
                    cardsContainer.innerHTML = 'Error loading cards data from both sources.';
                });
        });
};