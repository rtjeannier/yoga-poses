class YogaCard {
    constructor(poseName, baseCost) {
        this.poseName = poseName;
        this.baseCost = baseCost;
        this.categories = [];
        this.discounts = {};
        this.width = 175;
        this.height = 300;
        
        // Position categories with their colors
        this.categoryColors = {
            inversion: { color: '#8F00FF', y: 45 },  // Purple (top)
            standing: { color: '#228B22', y: 85 },    // Forest Green
            kneeling: { color: '#DAA520', y: 125 },   // Goldenrod
            seated: { color: '#CD853F', y: 165 },     // Peru
            supine: { color: '#4169E1', y: 205 },     // Royal Blue
            prone: { color: '#B22222', y: 245 }       // Firebrick (bottom)
        };
    }

    setCategories(categories) {
        this.categories = categories.split('|').map(c => c.trim());
    }

    setDiscounts(discounts) {
        this.discounts = {
            inversion: discounts.inversion === 'X' ? 'X' : (parseInt(discounts.inversion) || 0),
            standing: discounts.standing === 'X' ? 'X' : (parseInt(discounts.standing) || 0),
            kneeling: discounts.kneeling === 'X' ? 'X' : (parseInt(discounts.kneeling) || 0),
            seated: discounts.seated === 'X' ? 'X' : (parseInt(discounts.seated) || 0),
            supine: discounts.supine === 'X' ? 'X' : (parseInt(discounts.supine) || 0),
            prone: discounts.prone === 'X' ? 'X' : (parseInt(discounts.prone) || 0)
        };
    }

    generateSVG() {
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.width} ${this.height}">
            <!-- Card background -->
            <rect width="${this.width}" height="${this.height}" fill="white" stroke="black" stroke-width="2"/>
            
            <!-- Pose name -->
            <text x="${this.width/2}" y="30" text-anchor="middle" font-family="Arial" font-size="16">${this.poseName}</text>
            
            <!-- Base cost -->
            <text x="${this.width/2}" y="${this.height - 20}" text-anchor="middle" font-family="Arial" font-size="14">Base Cost: ${this.baseCost}</text>`;

        // Add left side category indicators
        this.categories.forEach((category, index) => {
            const catData = this.categoryColors[category];
            if (catData) {
                svg += `<rect x="0" y="${catData.y}" width="20" height="30" fill="${catData.color}"/>`;
            }
        });

        // Add right side - only show color boxes for valid transitions
        Object.entries(this.categoryColors).forEach(([category, data]) => {
            const discount = this.discounts[category];
            
            if (discount === 'X') {
                // Just show an X with no color box
                svg += `<text x="${this.width - 10}" y="${data.y + 20}" 
                    text-anchor="middle" font-family="Arial" fill="black" font-size="14" font-weight="bold">
                    X
                </text>`;
            } else {
                // Show color box with discount number for valid transitions
                svg += `<rect x="${this.width - 20}" y="${data.y}" width="20" height="30" fill="${data.color}"/>
                <text x="${this.width - 10}" y="${data.y + 20}" 
                    text-anchor="middle" font-family="Arial" fill="white" font-size="14">
                    ${discount}
                </text>`;
            }
        });

        svg += '</svg>';
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
            baseCost: parseInt(values[2]),
            discounts: {
                inversion: values[3].trim(),
                standing: values[4].trim(),
                kneeling: values[5].trim(),
                supine: values[6].trim(),
                seated: values[7].trim(),
                prone: values[8].trim()
            }
        };
        
        cards.push(cardData);
    }

    return cards;
}

// Load and display cards
window.onload = function() {
    const cardsContainer = document.getElementById('cards');
    const GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTI8UsAlO_CXg3Yk-ZBFy2Ez2tzDjV5a-YJ1LsS2dPiuzOA-7wbHIAsKGg2IxEAbUrDnmozLDDqC79I/pub?gid=0&single=true&output=csv';
    
    fetch(GOOGLE_SHEETS_URL)
        .then(response => response.text())
        .then(csvText => {
            const cards = parseCSVData(csvText);
            
            cards.forEach(cardData => {
                const card = new YogaCard(cardData.name, cardData.baseCost);
                card.setCategories(cardData.categories);
                card.setDiscounts(cardData.discounts);
                
                const div = document.createElement('div');
                div.className = 'card';
                div.innerHTML = card.generateSVG();
                cardsContainer.appendChild(div);
            });
        })
        .catch(error => {
            console.error('Error loading CSV:', error);
            cardsContainer.innerHTML = 'Error loading cards data.';
        });
};