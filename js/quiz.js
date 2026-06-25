// quiz.js - Security Awareness Quiz
const quizQuestions = [
  {
    q: "What is phishing?",
    options: ["A type of malware that encrypts files", "A social engineering attack using deceptive emails", "A network scanning technique", "A physical security breach"],
    correct: 1,
    explanation: "Phishing uses deceptive emails or websites to trick you into revealing credentials or personal data."
  },
  {
    q: "Which of the following is the strongest password?",
    options: ["Password123!", "ilovemycat", "T#e$ky!sBlv3&9q", "Admin2026"],
    correct: 2,
    explanation: "A strong password is long and uses a mix of uppercase, lowercase, numbers, and symbols without using dictionary words."
  },
  {
    q: "What does a VPN do?",
    options: ["Speeds up your internet connection", "Prevents all malware infections", "Encrypts your internet traffic and hides your IP", "Automatically updates your software"],
    correct: 2,
    explanation: "A Virtual Private Network (VPN) encrypts your data in transit, protecting it from interception on public networks."
  },
  {
    q: "What is Two-Factor Authentication (2FA)?",
    options: ["Entering your password twice", "Using two different antivirus programs", "Requiring a password and a secondary code/device", "Having two passwords for one account"],
    correct: 2,
    explanation: "2FA requires something you know (password) and something you have (e.g., phone app code) to log in."
  },
  {
    q: "Why is it dangerous to use public Wi-Fi?",
    options: ["It drains battery faster", "Hackers can easily intercept unencrypted data", "It causes physical damage to the device", "The connection is always slow"],
    correct: 1,
    explanation: "Public Wi-Fi is often unsecured, allowing attackers to perform Man-in-the-Middle (MitM) attacks to steal data."
  },
  {
    q: "What is ransomware?",
    options: ["Software that steals your contacts", "Malware that encrypts files and demands payment", "A tool used to hack Wi-Fi", "A virus that deletes the operating system"],
    correct: 1,
    explanation: "Ransomware locks you out of your data by encrypting it, demanding a ransom (usually crypto) for the decryption key."
  },
  {
    q: "How can you verify if a website is secure for entering data?",
    options: ["It has a professional design", "The URL starts with HTTPS and has a padlock icon", "It asks for your social security number", "It has a '100% Safe' badge"],
    correct: 1,
    explanation: "HTTPS means the connection between your browser and the server is encrypted using SSL/TLS."
  },
  {
    q: "What is Social Engineering?",
    options: ["Building secure social networks", "Manipulating people into giving up confidential info", "Programming social media algorithms", "A type of firewall configuration"],
    correct: 1,
    explanation: "Social engineering relies on human psychology rather than technical hacking techniques to gain access to systems."
  },
  {
    q: "Which is a sign that your computer might be infected with malware?",
    options: ["Unexpected pop-ups and extreme slowness", "The fan is running", "You receive a spam email", "Your mouse works normally"],
    correct: 0,
    explanation: "Malware often consumes system resources in the background or injects unwanted ads/pop-ups."
  },
  {
    q: "When should you update your software and operating system?",
    options: ["Once a year", "Only when the computer stops working", "As soon as updates become available", "Never, updates break things"],
    correct: 2,
    explanation: "Updates frequently contain security patches for newly discovered vulnerabilities. Delaying them leaves you at risk."
  }
];

let currentQuestionIndex = 0;
let score = 0;
let timerInterval;

function startTimer() {
  let timeLeft = 30;
  const timeDisplay = document.getElementById('quizTimeLeft');
  if(!timeDisplay) return;
  
  timeDisplay.innerText = timeLeft;
  clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    timeLeft--;
    timeDisplay.innerText = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleTimeout();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function handleTimeout() {
  const optionsDiv = document.getElementById('quizOptions');
  // Disable all options
  Array.from(optionsDiv.children).forEach((btn, index) => {
    btn.style.pointerEvents = 'none';
    if (index === quizQuestions[currentQuestionIndex].correct) {
      btn.classList.add('correct');
    }
  });
  
  showExplanation(false, "Time's up!");
}

function renderQuestion() {
  const qData = quizQuestions[currentQuestionIndex];
  const container = document.getElementById('quizContainer');
  
  const progressPercent = ((currentQuestionIndex) / quizQuestions.length) * 100;
  
  container.innerHTML = `
    <div class="quiz-header">
      <div>Question ${currentQuestionIndex + 1} of ${quizQuestions.length}</div>
      <div style="color: var(--accent); font-weight: bold;"><i class="fas fa-clock"></i> <span id="quizTimeLeft">30</span>s</div>
    </div>
    <div class="quiz-progress-bar">
      <div class="quiz-progress-fill" style="width: ${progressPercent}%"></div>
    </div>
    <div class="quiz-question">${qData.q}</div>
    <div class="quiz-options" id="quizOptions">
      ${qData.options.map((opt, idx) => `
        <div class="quiz-option" onclick="selectAnswer(${idx})">${opt}</div>
      `).join('')}
    </div>
    <div class="quiz-explanation" id="quizExplanation"></div>
    <button class="btn-primary quiz-next-btn" id="quizNextBtn" onclick="nextQuestion()">
      ${currentQuestionIndex === quizQuestions.length - 1 ? 'See Results' : 'Next Question'} <i class="fas fa-arrow-right"></i>
    </button>
  `;
  
  startTimer();
}

// Attach to window so HTML onclick can reach it
window.selectAnswer = function(selectedIndex) {
  stopTimer();
  const qData = quizQuestions[currentQuestionIndex];
  const optionsDiv = document.getElementById('quizOptions');
  
  // Disable further clicks
  Array.from(optionsDiv.children).forEach(btn => {
    btn.style.pointerEvents = 'none';
  });
  
  const isCorrect = selectedIndex === qData.correct;
  if (isCorrect) {
    score++;
    optionsDiv.children[selectedIndex].classList.add('correct');
  } else {
    optionsDiv.children[selectedIndex].classList.add('wrong');
    optionsDiv.children[qData.correct].classList.add('correct');
  }
  
  showExplanation(isCorrect, qData.explanation);
};

function showExplanation(isCorrect, text) {
  const expDiv = document.getElementById('quizExplanation');
  const nextBtn = document.getElementById('quizNextBtn');
  
  const icon = isCorrect ? '<i class="fas fa-check-circle" style="color: var(--success);"></i> Correct!' : '<i class="fas fa-times-circle" style="color: var(--danger);"></i> Incorrect.';
  
  expDiv.innerHTML = `<strong>${icon}</strong><br><p style="margin-top: 8px;">${text}</p>`;
  expDiv.style.display = 'block';
  nextBtn.style.display = 'inline-block';
}

window.nextQuestion = function() {
  currentQuestionIndex++;
  if (currentQuestionIndex < quizQuestions.length) {
    renderQuestion();
  } else {
    showResults();
  }
};

function showResults() {
  const container = document.getElementById('quizContainer');
  const percentage = Math.round((score / quizQuestions.length) * 100);
  
  let message, color;
  if (percentage >= 80) {
    message = "Excellent! You are a cybersecurity pro.";
    color = "var(--success)";
  } else if (percentage >= 50) {
    message = "Good job, but there's room to learn.";
    color = "var(--warning)";
  } else {
    message = "You need to brush up on your security knowledge.";
    color = "var(--danger)";
  }
  
  container.innerHTML = `
    <div style="text-align: center; padding: 30px 0;">
      <i class="fas fa-award" style="font-size: 5rem; color: ${color}; margin-bottom: 20px;"></i>
      <h2 style="font-size: 2.5rem; margin-bottom: 10px;">Quiz Complete!</h2>
      <div style="font-size: 4rem; font-family: var(--font-display); color: ${color}; font-weight: bold; margin-bottom: 20px;">${percentage}%</div>
      <p style="font-size: 1.2rem; margin-bottom: 30px;">You scored ${score} out of ${quizQuestions.length}.<br>${message}</p>
      
      <button class="btn-primary" onclick="restartQuiz()">
        <i class="fas fa-redo"></i> Retake Quiz
      </button>
      <button class="btn-ghost" style="margin-left: 10px;" onclick="closeQuizModal()">
        <i class="fas fa-times"></i> Close
      </button>
    </div>
  `;
}

window.restartQuiz = function() {
  currentQuestionIndex = 0;
  score = 0;
  renderQuestion();
};

window.initQuiz = function() {
  currentQuestionIndex = 0;
  score = 0;
  renderQuestion();
};
