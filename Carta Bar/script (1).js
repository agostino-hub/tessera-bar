// Gestione tessera bar digitale con 4 categorie

class BarLoyaltyCard {
    constructor() {
        // Configurazione categorie
        this.categories = {
            coffee: { max: 10, emoji: '☕', name: 'Caffè', description: 'Caffè gratuito' },
            breakfast: { max: 8, emoji: '🥐', name: 'Colazione', description: 'Colazione gratuita' },
            aperitivo: { max: 6, emoji: '🍹', name: 'Aperitivo', description: 'Aperitivo con stuzzichini gratuito' },
            snack: { max: 5, emoji: '🍪', name: 'Merendina', description: 'Merendina per bambini gratuita' }
        };
        
        // Punti per categoria
        this.points = {
            coffee: 0,
            breakfast: 0,
            aperitivo: 0,
            snack: 0
        };
        
        // Storico premi
        this.rewardsHistory = [];
        
        // Categoria corrente
        this.currentCategory = 'coffee';
        
        this.init();
    }

    init() {
        // Carica dati salvati
        this.loadData();
        
        // Event listeners per categorie
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.switchCategory(category);
            });
        });
        
        // Event listeners per pulsanti azione
        document.querySelectorAll('[data-action="add"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.addPoint(category);
            });
        });
        
        document.querySelectorAll('[data-action="redeem"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.redeemReward(category);
            });
        });
        
        // Aggiorna tutte le UI
        this.updateAllUI();
    }

    loadData() {
        // Carica dati da localStorage
        const savedPoints = localStorage.getItem('barCardPointsV2');
        const savedRewards = localStorage.getItem('barCardRewardsV2');
        
        if (savedPoints) {
            this.points = JSON.parse(savedPoints);
        }
        
        if (savedRewards) {
            this.rewardsHistory = JSON.parse(savedRewards);
        }
    }

    saveData() {
        // Salva dati in localStorage
        localStorage.setItem('barCardPointsV2', JSON.stringify(this.points));
        localStorage.setItem('barCardRewardsV2', JSON.stringify(this.rewardsHistory));
    }

    switchCategory(category) {
        this.currentCategory = category;
        
        // Aggiorna bottoni categorie
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        // Mostra/nascondi sezioni
        document.querySelectorAll('.category-section').forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById(`${category}-section`).style.display = 'block';
    }

    addPoint(category) {
        const maxPoints = this.categories[category].max;
        
        if (this.points[category] < maxPoints) {
            this.points[category]++;
            this.animatePointAdd(category);
            this.updateCategoryUI(category);
            this.saveData();
            
            // Vibrazione
            if ('vibrate' in navigator) {
                navigator.vibrate(50);
            }
        } else {
            const name = this.categories[category].name;
            this.showMessage(`Tessera ${name} completa! Riscatta il tuo omaggio prima di continuare.`);
        }
    }

    animatePointAdd(category) {
        const pointsValue = document.getElementById(`${category}Points`);
        pointsValue.style.transition = 'transform 0.3s ease';
        pointsValue.style.transform = 'scale(1.2)';
        setTimeout(() => {
            pointsValue.style.transform = 'scale(1)';
        }, 300);
    }

    redeemReward(category) {
        const maxPoints = this.categories[category].max;
        
        if (this.points[category] >= maxPoints) {
            // Aggiungi premio allo storico
            const now = new Date();
            const reward = {
                date: now.toLocaleDateString('it-IT'),
                time: now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
                category: category,
                emoji: this.categories[category].emoji,
                description: this.categories[category].description
            };
            
            this.rewardsHistory.unshift(reward);
            
            // Reset punti
            this.points[category] = 0;
            
            // Animazione celebrativa
            this.celebrateReward();
            
            // Aggiorna UI
            this.updateCategoryUI(category);
            this.updateRewardsHistory();
            this.saveData();
            
            // Vibrazione
            if ('vibrate' in navigator) {
                navigator.vibrate([100, 50, 100, 50, 100]);
            }
            
            this.showMessage(`🎉 Complimenti! ${this.categories[category].description} riscattato!`);
        }
    }

    celebrateReward() {
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#FDB99B', '#F6AA1C'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                this.createConfetti(colors[Math.floor(Math.random() * colors.length)]);
            }, i * 30);
        }
    }

    createConfetti(color) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = color;
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '-10px';
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '10000';
        
        document.body.appendChild(confetti);
        
        const animation = confetti.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(${window.innerHeight + 10}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], {
            duration: 2000 + Math.random() * 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        animation.onfinish = () => {
            confetti.remove();
        };
    }

    updateCategoryUI(category) {
        const current = this.points[category];
        const max = this.categories[category].max;
        
        // Aggiorna contatore punti
        document.getElementById(`${category}Points`).textContent = `${current}/${max}`;
        
        // Aggiorna barra progresso
        const progress = (current / max) * 100;
        document.getElementById(`${category}Progress`).style.width = progress + '%';
        
        // Aggiorna punti mancanti
        const toReward = max - current;
        document.getElementById(`${category}ToReward`).textContent = toReward;
        
        // Abilita/disabilita bottone riscatta
        const redeemBtn = document.querySelector(`[data-action="redeem"][data-category="${category}"]`);
        redeemBtn.disabled = current < max;
        
        // Aggiorna griglia
        this.updateGrid(category);
    }

    updateGrid(category) {
        const items = document.querySelectorAll(`.${category}-item`);
        const current = this.points[category];
        
        items.forEach((item, index) => {
            if (index < current) {
                item.classList.add('filled');
            } else {
                item.classList.remove('filled');
            }
        });
    }

    updateAllUI() {
        // Aggiorna UI per tutte le categorie
        Object.keys(this.categories).forEach(category => {
            this.updateCategoryUI(category);
        });
        
        // Aggiorna storico premi
        this.updateRewardsHistory();
    }

    updateRewardsHistory() {
        const rewardsList = document.getElementById('rewardsList');
        
        if (this.rewardsHistory.length === 0) {
            rewardsList.innerHTML = '<li class="no-rewards">Nessun premio riscattato ancora</li>';
        } else {
            rewardsList.innerHTML = this.rewardsHistory
                .slice(0, 15)
                .map(reward => `
                    <li class="reward-item">
                        <span>${reward.emoji} ${reward.description}</span>
                        <span class="reward-date">${reward.date} - ${reward.time}</span>
                    </li>
                `).join('');
        }
    }

    showMessage(message) {
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.background = '#333';
        toast.style.color = 'white';
        toast.style.padding = '15px 25px';
        toast.style.borderRadius = '10px';
        toast.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
        toast.style.zIndex = '10001';
        toast.style.maxWidth = '90%';
        toast.style.textAlign = 'center';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transition = 'opacity 0.3s ease';
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
}

// Funzioni per personalizzazione utente
function updateUserInfo() {
    const userName = prompt('Inserisci il tuo nome:');
    if (userName) {
        document.getElementById('userName').textContent = userName;
        localStorage.setItem('barCardUserName', userName);
        
        const initials = userName.split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
        document.getElementById('userInitials').textContent = initials;
    }
}

function loadUserInfo() {
    const savedName = localStorage.getItem('barCardUserName');
    if (savedName) {
        document.getElementById('userName').textContent = savedName;
        const initials = savedName.split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
        document.getElementById('userInitials').textContent = initials;
    }
}

function generateCardNumber() {
    const saved = localStorage.getItem('barCardNumber');
    if (saved) {
        return saved;
    }
    
    const number = Array.from({ length: 12 }, () => 
        Math.floor(Math.random() * 10)
    ).join('').match(/.{1,4}/g).join(' ');
    
    localStorage.setItem('barCardNumber', number);
    return number;
}

// Genera QR Code
function generateQRCode() {
    const cardNumber = localStorage.getItem('barCardNumber') || generateCardNumber();
    const userName = localStorage.getItem('barCardUserName') || 'Cliente';
    
    // Crea dati per il QR code
    const qrData = {
        cardNumber: cardNumber.replace(/ /g, ''),
        userName: userName,
        timestamp: Date.now()
    };
    
    // Converte in stringa JSON
    const qrString = JSON.stringify(qrData);
    
    // Pulisce il contenitore
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';
    
    // Genera il QR code
    new QRCode(qrContainer, {
        text: qrString,
        width: 180,
        height: 180,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Rigenera QR code (per sicurezza, cambia timestamp)
function refreshQRCode() {
    generateQRCode();
    
    // Mostra messaggio
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = '#4CAF50';
    toast.style.color = 'white';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.fontSize = '14px';
    toast.style.zIndex = '10001';
    toast.textContent = '✓ QR Code rigenerato';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transition = 'opacity 0.3s ease';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Inizializzazione
document.addEventListener('DOMContentLoaded', () => {
    // Carica informazioni utente
    loadUserInfo();
    
    // Genera/carica numero carta
    document.getElementById('cardNumber').textContent = generateCardNumber();
    
    // Genera QR Code
    generateQRCode();
    
    // Listener per rigenerare QR
    document.getElementById('refreshQR').addEventListener('click', refreshQRCode);
    
    // Inizializza card
    const loyaltyCard = new BarLoyaltyCard();
    
    // Click su avatar per cambiare nome
    document.querySelector('.avatar').addEventListener('click', updateUserInfo);
    
    // Easter egg: click sul titolo per reset completo
    let clickCount = 0;
    document.querySelector('.card-header h1').addEventListener('click', () => {
        clickCount++;
        if (clickCount >= 5) {
            if (confirm('Vuoi resettare completamente tutte le tessere?')) {
                localStorage.clear();
                location.reload();
            }
            clickCount = 0;
        }
        setTimeout(() => { clickCount = 0; }, 2000);
    });
});
