document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTS ---
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginBtn = document.getElementById('login-btn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    const submitComplaintBtn = document.getElementById('submit-complaint-btn');
    const cooldownTimerEl = document.getElementById('cooldown-timer');
    const challengeBtn = document.getElementById('challenge-btn');
    const challengeBox = document.getElementById('challenge-box');
    const apologyBtn = document.getElementById('apology-btn');
    const apologyModal = document.getElementById('apology-modal');
    const apologyText = document.getElementById('apology-text');
    const closeApologyModalBtn = document.getElementById('close-apology-modal-btn');
    const historyList = document.getElementById('history-list');
    const moodEmojis = document.querySelectorAll('.mood-emoji');
    const rewardCoins = document.getElementById('reward-coins');
    const rewardAmount = document.getElementById('reward-amount');
    const rewardModal = document.getElementById('reward-modal');
    const closeRewardModalBtn = document.getElementById('close-reward-modal-btn');
    const courtroomIcon = document.getElementById('courtroom-icon');
    const courtroomModal = document.getElementById('courtroom-modal');
    const closeCourtroomModalBtn = document.getElementById('close-courtroom-modal-btn');

    // Performance Rating Sliders and Report Card Grade Elements
    const ratingSliders = document.querySelectorAll('.card input[type="range"]');
    const reportCardGrades = {
        '💖 Romance': document.getElementById('grade-romance'),
        '😂 Humor': document.getElementById('grade-humor'),
        '💪 Effort': document.getElementById('grade-effort'),
        '👂 Listening': document.getElementById('grade-listening'),
        '🥰 Care': document.getElementById('grade-care'),
        '🗓️ Punctuality': document.getElementById('grade-punctuality'),
        '🧠 Thoughtfulness': document.getElementById('grade-thoughtfulness'),
    };
    const overallGradeEl = document.getElementById('overall-grade');


    // --- STATE & DATA ---
    let cooldownInterval;
    let cooldownTime = 0; // in seconds
    let complaintId = 0;
    let currentReward = 0; // Starting at 0 for the new feature

    const challenges = [
        "Plan a surprise date night!",
        "Cook dinner tonight.",
        "Give a 10-minute foot rub.",
        "Watch a movie of my choice, no complaints.",
        "Write a short, sweet love note.",
        "Do the dishes for the next two days."
    ];

    const apologies = [
        "My software needs an update, sorry for the bug.",
        "I have the emotional range of a teaspoon sometimes. My bad.",
        "I wasn't listening. I was thinking about the Roman Empire. Sorry.",
        "I'll be better. Probably. My sincerest apologies.",
        "Oops! Let me just CTRL+Z my last action. Sorry!",
        "Error 404: Brain not found. Apologies for the inconvenience."
    ];

    // --- FUNCTIONS ---
    function handleLogin() {
        if (usernameInput.value.toLowerCase() === 'ankita' && passwordInput.value === 'ankita') {
            loginSection.classList.add('hidden');
            dashboardSection.classList.remove('hidden');
            loginError.classList.add('hidden');
            updateAllGrades(); // Initial grade update on login
        } else {
            loginError.classList.remove('hidden');
        }
    }

    function startCooldown(duration) {
        cooldownTime = duration;
        submitComplaintBtn.disabled = true;
        submitComplaintBtn.textContent = 'On Cooldown';
        submitComplaintBtn.classList.add('opacity-50', 'cursor-not-allowed');

        updateCooldownTimer();
        cooldownInterval = setInterval(() => {
            cooldownTime--;
            updateCooldownTimer();
            if (cooldownTime <= 0) {
                clearInterval(cooldownInterval);
                submitComplaintBtn.disabled = false;
                submitComplaintBtn.textContent = 'File Complaint';
                submitComplaintBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                cooldownTimerEl.textContent = '00:00';
            }
        }, 1000);
    }

    function updateCooldownTimer() {
        const minutes = Math.floor(cooldownTime / 60);
        const seconds = cooldownTime % 60;
        cooldownTimerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function addComplaintToHistory() {
        const text = document.getElementById('complaint-text').value;
        const emoji = document.getElementById('emoji-feedback').value;
        const selectedCategory = document.querySelector('.complaint-category.active');

        if (!text && !emoji) {
            alert("Please enter a complaint or some emoji feedback.");
            return false;
        }

        complaintId++;
        const newComplaint = document.createElement('div');
        newComplaint.className = 'bg-gray-50 p-3 rounded-lg border border-gray-200';
        newComplaint.id = `complaint-${complaintId}`;
        newComplaint.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    ${selectedCategory ? `<span class="text-xs font-bold text-white px-2 py-1 rounded-full ${selectedCategory.classList.contains('bg-purple-200') ? 'bg-purple-500' : selectedCategory.classList.contains('bg-yellow-200') ? 'bg-yellow-500' : 'bg-pink-500'}">${selectedCategory.textContent}</span>` : ''}
                    <p class="font-semibold mt-1">${text || 'Emoji feedback given.'}</p>
                    ${emoji ? `<p class="text-2xl">${emoji}</p>` : ''}
                </div>
                <span class="status-badge bg-orange-200 text-orange-800 text-xs font-semibold px-2.5 py-1 rounded-full">Pending</span>
            </div>
            <button class="resolve-btn mt-2 text-sm text-green-600 font-semibold hover:underline" data-id="${complaintId}">Mark as Resolved</button>
        `;

        historyList.prepend(newComplaint);
        
        // Add event listener to the new resolve button
        newComplaint.querySelector('.resolve-btn').addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const complaintEl = document.getElementById(`complaint-${id}`);
            const statusBadge = complaintEl.querySelector('.status-badge');
            statusBadge.textContent = 'Resolved';
            statusBadge.classList.remove('bg-orange-200', 'text-orange-800');
            statusBadge.classList.add('bg-green-200', 'text-green-800');
            e.target.remove(); // Remove the button after resolving

            // Add reward
            currentReward += 5;
            updateRewardJar();
        });

        // Clear inputs
        document.getElementById('complaint-text').value = '';
        document.getElementById('emoji-feedback').value = '';
        if (selectedCategory) selectedCategory.classList.remove('active', 'ring-2', 'ring-offset-2', 'ring-indigo-500');

        return true;
    }
    
    function updateRewardJar() {
        rewardAmount.textContent = currentReward;
        const percentage = Math.min(currentReward, 100);
        rewardCoins.style.height = `${percentage}%`;

        // Check if the jar is full
        if (currentReward >= 100) {
            rewardModal.classList.remove('hidden');
            currentReward = 0; // Reset the jar
            // updateRewardJar() is called implicitly by the next tick, no need for another call
        }
    }

    function getGrade(value) {
        if (value >= 95) return 'A+';
        if (value >= 90) return 'A';
        if (value >= 85) return 'A-';
        if (value >= 80) return 'B+';
        if (value >= 75) return 'B';
        if (value >= 70) return 'B-';
        if (value >= 65) return 'C+';
        if (value >= 60) return 'C';
        if (value >= 55) return 'C-';
        if (value >= 50) return 'D+';
        if (value >= 40) return 'D';
        return 'F';
    }

    function updateAllGrades() {
        let totalScore = 0;
        let ratingCount = 0;
        ratingSliders.forEach(slider => {
            const ratingName = slider.previousElementSibling.textContent;
            const grade = getGrade(parseInt(slider.value));
            const gradeElement = reportCardGrades[ratingName];
            if (gradeElement) {
                gradeElement.textContent = grade;
                // Summing up for overall grade (using a simple average)
                totalScore += parseInt(slider.value);
                ratingCount++;
            }
        });

        if (ratingCount > 0) {
            const averageScore = totalScore / ratingCount;
            overallGradeEl.textContent = getGrade(averageScore);
        }
    }


    // --- EVENT LISTENERS ---
    loginBtn.addEventListener('click', handleLogin);
    passwordInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    submitComplaintBtn.addEventListener('click', () => {
        if (addComplaintToHistory()) {
            startCooldown(10); // 10 second cooldown for demo
        }
    });

    document.querySelectorAll('.complaint-category').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.complaint-category').forEach(b => b.classList.remove('active', 'ring-2', 'ring-offset-2', 'ring-indigo-500'));
            btn.classList.add('active', 'ring-2', 'ring-offset-2', 'ring-indigo-500');
        });
    });

    challengeBtn.addEventListener('click', () => {
        const randomIndex = Math.floor(Math.random() * challenges.length);
        challengeBox.textContent = challenges[randomIndex];
    });

    apologyBtn.addEventListener('click', () => {
        const randomIndex = Math.floor(Math.random() * apologies.length);
        apologyText.textContent = apologies[randomIndex];
        apologyModal.classList.remove('hidden');
    });

    closeApologyModalBtn.addEventListener('click', () => {
        apologyModal.classList.add('hidden');
    });

    closeRewardModalBtn.addEventListener('click', () => {
        rewardModal.classList.add('hidden');
        updateRewardJar();
    });

    courtroomIcon.addEventListener('click', () => {
        courtroomModal.classList.remove('hidden');
    });

    closeCourtroomModalBtn.addEventListener('click', () => {
        courtroomModal.classList.add('hidden');
    });

    moodEmojis.forEach(emoji => {
        emoji.addEventListener('click', () => {
            moodEmojis.forEach(e => e.classList.remove('selected'));
            emoji.classList.add('selected');
        });
    });

    // Event listener for all sliders to update the report card
    ratingSliders.forEach(slider => {
        slider.addEventListener('input', updateAllGrades);
    });
});