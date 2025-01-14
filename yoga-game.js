// YogaCard class definition
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

// Game Component
const YogaFlowGame = () => {
    const [players, setPlayers] = React.useState([
        { id: 1, name: 'Player 1', sequence: [], energy: 2 },
        { id: 2, name: 'Player 2', sequence: [], energy: 2 }
    ]);
    const [currentPlayer, setCurrentPlayer] = React.useState(0);
    const [heat, setHeat] = React.useState(5);
    const [availablePoses, setAvailablePoses] = React.useState([]);
    const [finalFlow, setFinalFlow] = React.useState([null, null, null, null, null]);

    // Calculate heat based on pose type and chakra
    const calculateHeatValue = (categories, chakra) => {
        const categoryList = categories.split('|');
        
        // Base heat values for positions
        if (categoryList.includes('inversion')) return 2;
        if (categoryList.includes('standing')) return 1;
        if (categoryList.includes('prone')) return 1;
        if (categoryList.includes('seated')) return -1;
        if (categoryList.includes('supine')) return -2;
        
        // Chakra-based heat adjustments
        if (chakra === 'solar') return 1;
        if (chakra === 'crown' || chakra === 'moon') return -1;
        
        return 0;
    };

    // Add a pose to a player's sequence
    const addPoseToSequence = (playerIndex, pose) => {
        const updatedPlayers = [...players];
        const player = updatedPlayers[playerIndex];
        
        if (player.energy >= pose.cost) {
            player.sequence.push(pose);
            player.energy -= pose.cost;
            setHeat(prevHeat => {
                const newHeat = prevHeat + pose.heat;
                // Check for game over conditions
                if (newHeat >= 10) alert("Too hot! Game Over!");
                if (newHeat <= 0) alert("Too cold! Game Over!");
                return newHeat;
            });
            setPlayers(updatedPlayers);
        } else {
            alert("Not enough energy!");
        }
    };

    // End the current player's turn
    const endTurn = () => {
        const player = players[currentPlayer];
        let energyGained = 0;

        // Calculate energy from transitions
        if (player.sequence.length > 1) {
            for (let i = 1; i < player.sequence.length; i++) {
                const prevPose = player.sequence[i-1];
                const currentPose = player.sequence[i];
                
                // Check transitions from all categories of previous pose
                prevPose.categories.forEach(category => {
                    const transitionValue = currentPose.transitions[category];
                    if (transitionValue && transitionValue !== '0') {
                        energyGained += parseInt(transitionValue);
                    }
                });
            }
        }

        energyGained = Math.max(1, energyGained); // Minimum 1 energy per turn
        
        const updatedPlayers = [...players];
        updatedPlayers[currentPlayer].energy += energyGained;
        setPlayers(updatedPlayers);
        
        setCurrentPlayer((currentPlayer + 1) % players.length);
    };

    // Load the poses data from CSV
    React.useEffect(() => {
        fetch('poses.csv')
            .then(response => response.text())
            .then(csvText => {
                console.log('CSV loaded:', csvText); // Debug log
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: function(results) {
                        console.log('Parsed results:', results); // Debug log
                        const poses = results.data.map(row => {
                            const card = new YogaCard(row.name, parseInt(row.activationCost));
                            
                            card.setCategories(row.categories);
                            card.setChakraType(row.chakraType);
                            card.setTransitions({
                                inversion: row.inversion || '',
                                standing: row.standing || '',
                                kneeling: row.kneeling || '',
                                seated: row.seated || '',
                                supine: row.supine || '',
                                prone: row.prone || ''
                            });
                            card.setEffects(
                                row.activatedEffect || 'No effect', 
                                row.discardEffect || 'No effect'
                            );

                            return {
                                card: card,
                                name: row.name,
                                categories: row.categories.split('|'),
                                cost: parseInt(row.activationCost),
                                chakraType: row.chakraType,
                                heat: calculateHeatValue(row.categories, row.chakraType),
                                transitions: {
                                    inversion: row.inversion || '',
                                    standing: row.standing || '',
                                    kneeling: row.kneeling || '',
                                    seated: row.seated || '',
                                    supine: row.supine || '',
                                    prone: row.prone || ''
                                }
                            };
                        });
                        console.log('Created poses:', poses); // Debug log
                        setAvailablePoses(poses);
                    },
                    error: function(error) {
                        console.error('Papa Parse error:', error);
                    }
                });
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
    }, []);

    // Debug render to see what's happening with the SVG
    const renderCard = (pose, index, location) => {
        console.log('Rendering card:', pose); // Debug log
        const svgContent = pose.card.generateSVG();
        console.log('SVG content:', svgContent); // Debug log
        return (
            <div 
                key={`${location}-${index}`}
                className="card cursor-pointer" 
                onClick={() => addPoseToSequence(currentPlayer, pose)}
                style={{
                    width: '175px',
                    height: '300px',
                    margin: '5px',
                    display: 'inline-block'
                }}
                dangerouslySetInnerHTML={{ __html: svgContent }}
            />
        );
    };

    console.log('Available poses:', availablePoses); // Debug log

    return (
        <div className="container">
            <div className="mb-4">
                <h2 className="text-xl font-bold">Heat Level: {heat}</h2>
                <div style={{ width: '100%', height: '1rem', backgroundColor: '#e5e7eb', borderRadius: '0.25rem' }}>
                    <div 
                        style={{
                            height: '100%',
                            width: `${(heat / 10) * 100}%`,
                            backgroundColor: heat > 7 ? 'red' : heat < 3 ? 'blue' : 'green',
                            borderRadius: '0.25rem',
                            transition: 'all 500ms'
                        }}
                    />
                </div>
            </div>

            <div className="mb-4">
                <h2 className="text-xl font-bold">Available Poses</h2>
                <div className="flex flex-wrap gap-2">
                    {availablePoses.map((pose, index) => 
                        renderCard(pose, index, 'available')
                    )}
                </div>
            </div>

            {players.map((player, index) => (
                <div key={player.id} className="mb-4">
                    <h2 className="text-xl font-bold">
                        {player.name} {index === currentPlayer ? '(Current Turn)' : ''}
                    </h2>
                    <div>Energy: {player.energy}</div>
                    <div className="flex flex-wrap gap-2">
                        {player.sequence.map((pose, poseIndex) => 
                            renderCard(pose, poseIndex, 'sequence')
                        )}
                    </div>
                </div>
            ))}

            <button 
                className="button"
                onClick={endTurn}
            >
                End Turn
            </button>
        </div>
    );
};

// Render the game directly
ReactDOM.render(
    <YogaFlowGame />,
    document.getElementById('root')
);