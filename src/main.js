
// Global variables to store user selections
let userSelections = {
    age: '',
    gender: '',
    theme: ''
};

let currentStep = 1;
let currentStory = '';

// API Configuration
const GEMINI_API_KEY = 'AIzaSyCaGqBbo0k73A5GoSYl16QvDEh4wMNY8cI';

// Application State Management
class StoryForgeApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        console.log('StoryForge App Initialized');
    }

    setupEventListeners() {
        // Age input handling
        const ageInput = document.getElementById('age-input');
        const ageContinueBtn = document.getElementById('age-continue');
        
        ageInput.addEventListener('input', () => {
            const age = parseInt(ageInput.value);
            if (age >= 1 && age <= 120) {
                ageContinueBtn.disabled = false;
                userSelections.age = age;
            } else {
                ageContinueBtn.disabled = true;
            }
        });

        ageContinueBtn.addEventListener('click', () => {
            if (userSelections.age) {
                this.nextStep();
            }
        });

        // Gender selection
        document.querySelectorAll('#step-2 .option-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.selectOption('gender', card.dataset.value, card);
                setTimeout(() => this.nextStep(), 500);
            });
        });

        // Theme selection
        document.querySelectorAll('#step-3 .theme-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.selectOption('theme', card.dataset.value, card);
                this.showGenerateButton();
            });
        });

        // Back buttons
        document.getElementById('back-step2').addEventListener('click', () => this.previousStep());
        document.getElementById('back-step3').addEventListener('click', () => this.previousStep());
        document.getElementById('back-step4').addEventListener('click', () => this.previousStep());

        // Generate story button
        document.getElementById('generate-story-btn').addEventListener('click', () => this.nextStep());

        // Story actions
        document.getElementById('generate-new').addEventListener('click', () => this.generateNewStory());
        document.getElementById('start-over').addEventListener('click', () => this.startOver());
    }

    selectOption(type, value, element) {
        // Remove previous selection
        const container = element.parentElement;
        container.querySelectorAll('.selected').forEach(el => {
            el.classList.remove('selected');
        });

        // Add selection to current element
        element.classList.add('selected');
        
        // Store selection
        userSelections[type] = value;
        
        console.log('Selected:', type, value);
    }

    showGenerateButton() {
        const generateBtn = document.getElementById('generate-story-btn');
        generateBtn.style.display = 'flex';
        generateBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    nextStep() {
        if (currentStep < 4) {
            // Hide current step
            document.getElementById(`step-${currentStep}`).classList.remove('active');

            currentStep++;

            // Show next step
            document.getElementById(`step-${currentStep}`).classList.add('active');

            // If we're at step 4, generate the story
            if (currentStep === 4) {
                this.generateStory();
            }
        }
    }

    previousStep() {
        if (currentStep > 1) {
            // Hide current step
            document.getElementById(`step-${currentStep}`).classList.remove('active');

            currentStep--;

            // Show previous step
            document.getElementById(`step-${currentStep}`).classList.add('active');

            // Hide generate button if going back to step 3
            if (currentStep === 3) {
                document.getElementById('generate-story-btn').style.display = 'none';
            }
        }
    }

    async generateStory() {
        const loadingElement = document.getElementById('loading');
        const storyElement = document.getElementById('story-result');
        const backButton = document.getElementById('back-step4');
        
        // Show loading, hide story result and back button
        loadingElement.style.display = 'block';
        storyElement.style.display = 'none';
        backButton.style.display = 'none';

        try {
            // Generate story
            console.log('Generating story...');
            const story = await this.callGeminiAPI(userSelections);
            currentStory = story;
            
            // Show story
            loadingElement.style.display = 'none';
            storyElement.style.display = 'block';
            document.getElementById('story-text').textContent = story;

        } catch (error) {
            console.error('Error generating story:', error);
            
            // Show error message
            loadingElement.style.display = 'none';
            storyElement.style.display = 'block';
            document.getElementById('story-text').textContent = 'Sorry, there was an error generating your story. Please check your API key and try again.';
        }
    }

    async callGeminiAPI(selections) {
        const ageCategory = this.getAgeCategory(selections.age);
        
        const prompt = `Write a ${selections.theme} and Space story suitable for a ${ageCategory} (age ${selections.age}). The main character should be ${selections.gender}. Make the story engaging, age-appropriate, and around 300-500 words long. Include vivid descriptions and dialogue to make it interesting.Add emojis to improve the interaction and enagage the user to read`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH", 
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            console.log('Gemini API Response:', data);
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Invalid response format from Gemini API');
            }

        } catch (error) {
            console.error('Gemini API Error:', error);
            throw error;
        }
    }

    getAgeCategory(age) {
        if (age <= 12) return 'child';
        if (age <= 17) return 'teenager';
        return 'adult';
    }

    generateNewStory() {
        this.generateStory();
    }

    startOver() {
        // Reset all selections
        userSelections = {
            age: '',
            gender: '',  
            theme: ''
        };
        
        currentStep = 1;
        currentStory = '';
        
        // Reset UI
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });
        
        document.querySelectorAll('.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Reset age input
        document.getElementById('age-input').value = '';
        document.getElementById('age-continue').disabled = true;
        
        // Hide generate button
        document.getElementById('generate-story-btn').style.display = 'none';
        
        // Show first step
        document.getElementById('step-1').classList.add('active');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StoryForgeApp();
});
