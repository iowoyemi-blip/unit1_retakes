// This helper function must be in the global scope to be accessible by the inline `onclick` attribute.
function insertSymbol(symbol, inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    input.value = input.value.substring(0, start) + symbol + input.value.substring(end);
    input.focus();
    input.setSelectionRange(start + 1, start + 1);
}

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let studentName = '';
    let currentQuestions = [];
    let score = 0;
    let questionsAnswered = 0;

    // --- DOM Elements ---
    const startScreen = document.getElementById('start-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const studentNameInput = document.getElementById('student-name-input');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const studentNameDisplay = document.getElementById('student-name-display');
    const scoreDisplay = document.getElementById('score-display');
    const quizContainer = document.getElementById('quiz-container');
    const newQuizBtn = document.getElementById('new-quiz-btn');
    const completionContainer = document.getElementById('completion-container');
    
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // --- STATIC QUESTION BANK ---
    function getStaticQuiz() {
        const questions = [
            // 1. Power Rule
            { question: 'Use the power rule to simplify: $$(-3ab)^{2}$$', answer: '9a^2b^2', prettyAnswer: '9a<sup>2</sup>b<sup>2</sup>', solution: '<p>Apply the exponent to each factor: $$(-3)^{2}(a)^{2}(b)^{2} = 9a^{2}b^{2}$$</p>', type: 'Exponent Rule' },
            // 2. Product Rule
            { question: 'Use the product rule to simplify: $$(2x^{3}y^{4}) \\cdot (4x^{2}y^{2})$$', answer: '8x^5y^6', prettyAnswer: '8x<sup>5</sup>y<sup>6</sup>', solution: '<p>Multiply coefficients and add exponents of like bases: $$(2 \\cdot 4)(x^{3+2})(y^{4+2}) = 8x^{5}y^{6}$$</p>', type: 'Exponent Rule' },
            // 3. Quotient Rule
            { question: 'Use the quotient rule to simplify: $$\\frac{6s^{3}p^{12}}{-3sp^{4}}$$', answer: '-2s^2p^8', prettyAnswer: '-2s<sup>2</sup>p<sup>8</sup>', solution: '<p>Divide coefficients (6 / -3 = -2) and subtract exponents.</p><p>$$s^{3-1} = s^{2}$$</p><p>$$p^{12-4} = p^{8}$$</p><p>Final Answer: $$-2s^{2}p^{8}$$</p>', type: 'Exponent Rule' },
            // 4. Simplify Radical w/ Variables
            { question: 'Simplify: $$\\sqrt{20x^{6}y^{5}}$$', answer: '2x^3y^2√5y', prettyAnswer: '2x<sup>3</sup>y<sup>2</sup>&radic;5y', solution: '<p>$$\\sqrt{4 \\cdot 5 \\cdot x^6 \\cdot y^4 \\cdot y} = 2x^{3}y^{2}\\sqrt{5y}$$</p>', type: 'Simplify Radical' },
            // 5. Simplify Radical Fraction
            { question: 'The expression $$\\sqrt{\\frac{12}{81}}$$ in the simplest form is', answer: '2√3/9', prettyAnswer: '2&radic;3/9', solution: '<p>$$\\frac{\\sqrt{12}}{\\sqrt{81}} = \\frac{\\sqrt{4 \\cdot 3}}{9} = \\frac{2\\sqrt{3}}{9}$$</p>', type: 'Simplify Radical' },
            // 6. Add/Subtract Radicals
            { question: 'The expression $$\\sqrt{48} + \\sqrt{27}$$ is equivalent to', answer: '7√3', prettyAnswer: '7&radic;3', solution: '<p>$$\\sqrt{16 \\cdot 3} + \\sqrt{9 \\cdot 3} = 4\\sqrt{3} + 3\\sqrt{3} = 7\\sqrt{3}$$</p>', type: 'Radical Operation' },
            // 7. Multiply Radicals
            { question: 'Multiply and simplify. $$\\sqrt{5} \\cdot \\sqrt{7}$$ is equivalent to', answer: '√35', prettyAnswer: '&radic;35', solution: '<p>$$\\sqrt{5 \\cdot 7} = \\sqrt{35}$$. Since 35 has no perfect square factors, this is the simplest form.</p>', type: 'Radical Operation' },
            // 8a. Evaluate Negation Exponent
            { question: 'Evaluate: $$-2^{6}$$', answer: '-64', prettyAnswer: '-64', solution: '<p>The exponent applies only to the 2: $$-(2^{6}) = -64$$</p>', type: 'Evaluate' },
            // 8b. Evaluate Negative Base Exponent
            { question: 'Evaluate: $$(-1)^{306}$$', answer: '1', prettyAnswer: '1', solution: '<p>A negative base to an even power is positive.</p>', type: 'Evaluate' },
            // 9a. Complex Expression A
            { question: 'Simplify using only positive exponents: $$(\\frac{-8xy^{7} \\cdot x^{3}y^{3}}{2x^{2} \\cdot 2x^{3}y^{4}})^{3}$$', answer: '-8y^18/x^3', prettyAnswer: '-8y<sup>18</sup>/x<sup>3</sup>', solution: "<p><b>Simplify Inside:</b> $$\\frac{-8x^{4}y^{10}}{4x^{5}y^{4}} = -2x^{-1}y^{6}$$</p><p><b>Apply Outer Power:</b> $$(-2x^{-1}y^{6})^{3} = -8x^{-3}y^{18}$$</p><p><b>Positive Exponents:</b> $$\\frac{-8y^{18}}{x^{3}}$$'</p>", type: 'Complex Expression' },
            // 9b. Complex Expression B
            { question: 'Simplify using only positive exponents: $$(\\frac{(3xy^{5})^{2}}{(x^{2}y^{3})^{3} \\cdot 3x^{4}y^{2}})^{2}$$', answer: '9/(x^16y^2)', prettyAnswer: '9/(x<sup>16</sup>y<sup>2</sup>)', solution: "<p><b>Numerator:</b> $$(3xy^{5})^{2} = 9x^{2}y^{10}$$</p><p><b>Denominator:</b> $$(x^{6}y^{9})(3x^{4}y^{2}) = 3x^{10}y^{11}$$</p><p><b>Simplify Fraction:</b> $$\\frac{9x^{2}y^{10}}{3x^{10}y^{11}} = 3x^{-8}y^{-1}$$</p><p><b>Outer Power:</b> $$(3x^{-8}y^{-1})^{2} = 9x^{-16}y^{-2} = \\frac{9}{x^{16}y^{2}}$$'</p>", type: 'Complex Expression' },
            // 10a. Simplify Simple Radical
            { question: 'Simplify: $$\\sqrt{45}$$', answer: '3√2', prettyAnswer: '3&radic;2', solution: '<p>$$\\sqrt{9 \\cdot 5} = 3\\sqrt{5}$$</p>', type: 'Simplify Radical' },
            // 10b. Simplify Radical w/ Variables
            { question: 'Simplify: $$\\sqrt{40a^{4}b^{5}c^{6}}$$', answer: '2a^2b^2c^3√10b', prettyAnswer: '2a<sup>2</sup>b<sup>2</sup>c<sup>3</sup>&radic;10b', solution: '<p>$$\\sqrt{4 \\cdot 10 \\cdot a^4 \\cdot b^4 \\cdot b \\cdot c^6} = 2a^{2}b^{2}c^{3}\\sqrt{10b}$$</p>', type: 'Simplify Radical' },
            // 11a. Add/Subtract Radicals w/ Coeffs
            { question: 'Simplify: $$8\\sqrt{20} - 6\\sqrt{5}$$', answer: '10√5', prettyAnswer: '10&radic;5', solution: '<p>$$8\\sqrt{4 \\cdot 5} - 6\\sqrt{5} = 8(2)\\sqrt{5} - 6\\sqrt{5} = 16\\sqrt{5} - 6\\sqrt{5} = 10\\sqrt{5}$$</p>', type: 'Radical Operation' },
            // 11c. Multiply Radicals w/ Coeffs
            { question: 'Simplify: $$2\\sqrt{10} \\cdot \\sqrt{6}$$', answer: '4√15', prettyAnswer: '4&radic;15', solution: '<p>$$2\\sqrt{10 \\cdot 6} = 2\\sqrt{60} = 2\\sqrt{4 \\cdot 15} = 2(2)\\sqrt{15} = 4\\sqrt{15}$$</p>', type: 'Radical Operation' },
            // 11d. Simple Radical Division
            { question: 'Simplify: $$\\frac{\\sqrt{200}}{\\sqrt{5}}$$', answer: '2√10', prettyAnswer: '2&radic;10', solution: '<p>$$\\sqrt{\\frac{200}{5}} = \\sqrt{40} = \\sqrt{4 \\cdot 10} = 2\\sqrt{10}$$</p>', type: 'Radical Operation' },
            // 11e. Rationalize Radical Division
            { question: 'Simplify: $$\\frac{\\sqrt{2}}{\\sqrt{3}}$$', answer: '√6/3', prettyAnswer: '&radic;6/3', solution: '<p>$$\\frac{\\sqrt{2}}{\\sqrt{3}} \\cdot \\frac{\\sqrt{3}}{\\sqrt{3}} = \\frac{\\sqrt{6}}{3}$$</p>', type: 'Radical Operation' }
        ];
        return questions;
    }

    // --- QUIZ LOGIC ---
    function generateQuiz() {
        score = 0; questionsAnswered = 0;
        completionContainer.innerHTML = ''; completionContainer.classList.add('hidden');
        quizContainer.innerHTML = `<div class="text-center"><p class="text-gray-600">Loading quiz...</p></div>`;
        updateScoreDisplay();
        
        setTimeout(() => {
            currentQuestions = getStaticQuiz();
            renderQuiz(shuffleArray(currentQuestions));
        }, 50);
    }

    function renderQuiz(questions) {
        const cardsHTML = questions.map((q, index) => {
            const placeholder = 'Enter your simplified answer';
            return `<div class="bg-white p-6 rounded-lg shadow-md"><div class="flex justify-between items-start"><div class="text-lg font-medium text-gray-800 pr-4"><span class="font-bold mr-2">${index + 1}.</span> ${q.question}</div><span class="flex-shrink-0 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${q.type}</span></div><div class="mt-4 flex flex-col sm:flex-row sm:items-center"><div class="relative flex-grow"><input type="text" id="answer-${index}" class="w-full pl-4 pr-24 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="${placeholder}"><div class="absolute top-1/2 right-1 transform -translate-y-1/2"><button class="h-8 w-8 text-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-sans rounded-md" onclick="insertSymbol('√', 'answer-${index}')">√</button><button class="h-8 w-8 text-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-sans rounded-md ml-1" onclick="insertSymbol('^', 'answer-${index}')">xʸ</button></div></div><button id="submit-${index}" class="mt-2 sm:mt-0 sm:ml-2 w-full sm:w-auto px-6 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600">Submit</button></div><div id="solution-${index}" class="hidden mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">${q.solution}</div></div>`;
        }).join('');
        quizContainer.innerHTML = cardsHTML;
        try { MathJax.typesetPromise(); } catch (e) { console.error("MathJax rendering failed but quiz is functional.", e); }
        updateScoreDisplay();
        questions.forEach((q, index) => {
            document.getElementById(`submit-${index}`).addEventListener('click', () => checkAnswer(index, q.answer, q.prettyAnswer, q.solution));
            document.getElementById(`answer-${index}`).addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); checkAnswer(index, q.answer, q.prettyAnswer, q.solution); } });
        });
    }

    function checkAnswer(index, correctAnswer, prettyAnswer, solution) {
        const userInputEl = document.getElementById(`answer-${index}`);
        if (userInputEl.disabled) return;
        const userInputClean = userInputEl.value.replace(/\s/g, '').replace(/[()*]/g,'');
        const correctAnswerClean = correctAnswer.toString().replace(/\s/g, '');
        const isCorrect = userInputClean === correctAnswerClean;
        questionsAnswered++;
        if (isCorrect) {
            score++;
            userInputEl.classList.add('border-green-500', 'border-2', 'bg-green-50');
        } else {
            userInputEl.classList.add('border-red-500', 'border-2', 'bg-red-50');
            const correctAnswerEl = document.createElement('p');
            correctAnswerEl.className = 'mt-2 text-red-600 font-semibold';
            const displayAnswer = prettyAnswer || correctAnswer;
            correctAnswerEl.innerHTML = `Correct answer: <span class="font-bold">${displayAnswer.toString().replace(/\^/g,'<sup>').replace(/√/g,'&radic;')}</span>`;
            solutionDiv.prepend(correctAnswerEl);
        }
        currentQuestions[index].userAnswer = userInputEl.value;
        currentQuestions[index].isCorrect = isCorrect;
        const submitBtn = document.getElementById(`submit-${index}`), solutionDiv = document.getElementById(`solution-${index}`);
        solutionDiv.innerHTML = (solutionDiv.hasChildNodes() && solutionDiv.firstChild.tagName === 'P' ? solutionDiv.firstChild.outerHTML : '') + solution;
        userInputEl.disabled = true;
        submitBtn.disabled = true;
        submitBtn.classList.add('btn-disabled');
        solutionDiv.classList.remove('hidden');
        try { MathJax.typesetPromise([`#solution-${index}`]); } catch (e) { console.error("MathJax rendering failed.", e); }
        updateScoreDisplay();
        if (questionsAnswered === currentQuestions.length && score === currentQuestions.length) { showCompletion(); }
    }

    function showCompletion() {
        completionContainer.classList.remove('hidden');
        completionContainer.innerHTML = `<div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-lg"><h2 class="text-2xl font-bold">Mastery Achieved!</h2><p class="mt-2">Congratulations, you answered all questions correctly. You can now download your verification file to submit.</p><button id="download-score-btn" class="mt-4 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">Download Verification File</button></div>`;
        document.getElementById('download-score-btn').addEventListener('click', downloadScore);
    }

    function downloadScore() {
        try {
            const verificationData = {
                studentName: studentName, quizTitle: "Unit 1 Test Retake", completionDate: new Date().toISOString(),
                masteryAttempt: {
                    score: score, totalQuestions: currentQuestions.length,
                    questions: currentQuestions.map(q => ({
                        question: q.question.replace(/\$\$/g, ''),
                        userAnswer: q.userAnswer, correctAnswer: q.answer,
                    }))
                }
            };
            const jsonString = JSON.stringify(verificationData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none'; a.href = url;
            const safeName = studentName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            a.download = `${safeName}_unit1_test_retake.json`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        } catch (error) { console.error("Download failed:", error); alert("An error occurred while creating the download file."); }
    }
    
    // --- INITIALIZATION ---
    startQuizBtn.addEventListener('click', () => {
        const name = studentNameInput.value.trim();
        if (name) {
            studentName = name;
            studentNameDisplay.textContent = studentName;
            startScreen.classList.add('hidden');
            quizScreen.classList.remove('hidden');
            generateQuiz();
        } else {
            alert('Please enter your name to start.');
        }
    });
    newQuizBtn.addEventListener('click', generateQuiz);
});
</script>
</body>
</html>
