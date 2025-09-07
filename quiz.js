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

    // --- DATA for Problem Generation ---
    const perfectSquares = [4, 9, 16, 25, 36, 49, 64, 81, 100];
    const primes = [2, 3, 5, 7];
    const coeffs = [-5, -4, -3, -2, 2, 3, 4, 5];
    const variables = ['x', 'y', 'z', 'a', 'b', 'c', 'p', 's'];

    // --- UTILITY FUNCTIONS ---
    const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    function simplifyRadical(n) {
        if (n <= 1) return { coeff: n, rad: 1 };
        let coeff = 1;
        for (let i = Math.floor(Math.sqrt(n)); i > 1; i--) {
            if (n % (i * i) === 0) {
                coeff = i;
                n = n / (i * i);
                break;
            }
        }
        return { coeff, rad: n };
    }

    function formatRadicalAnswer(coeff, rad) {
        if (rad === 1 || rad === 0) return coeff.toString();
        if (coeff === 1) return `√${rad}`;
        if (coeff === -1) return `-√${rad}`;
        return `${coeff}√${rad}`;
    }

    function formatLatexRadical(coeff, rad) {
        if (rad === 1 || rad === 0) return coeff.toString();
        if (coeff === 1) return `\\sqrt{${rad}}`;
        if (coeff === -1) return `-\\sqrt{${rad}}`;
        return `${coeff}\\sqrt{${rad}}`;
    }

    // --- PROBLEM GENERATORS ---
    function generatePowerRuleProblem() {
        const c = getRandomElement(coeffs); const p = 2; const vars = shuffleArray(variables).slice(0, 2);
        const question = `Use the power rule to simplify: $$(${c}${vars[0]}${vars[1]})^{${p}}$$`;
        const answer = `${Math.pow(c,p)}${vars[0]}^${p}${vars[1]}^${p}`;
        const solution = `<p>Apply the exponent to each factor inside: $$(${c})^{${p}}(${vars[0]})^{${p}}(${vars[1]})^{${p}} = ${answer}$$</p>`;
        return { question, answer, solution, type: 'Exponent Rule' };
    }
    function generateProductRuleProblem() {
        const c1 = getRandomInt(-5, 5) || 1; const c2 = getRandomInt(2, 5); const [v1, v2] = shuffleArray(variables).slice(0, 2);
        const p1 = getRandomInt(2,5), p2 = getRandomInt(2,5), p3 = getRandomInt(2,5), p4 = getRandomInt(2,5);
        const question = `Use the product rule to simplify: $$(${c1}${v1}^{${p1}}${v2}^{${p2}}) \\cdot (${c2}${v1}^{${p3}}${v2}^{${p4}})$$`;
        const answer = `${c1*c2}${v1}^${p1+p3}${v2}^${p2+p4}`;
        const solution = `<p>Multiply coefficients and add exponents of like bases: $$(${c1} \\cdot ${c2})(${v1}^{${p1}+${p3}})(${v2}^{${p2}+${p4}}) = ${answer}$$</p>`;
        return { question, answer, solution, type: 'Exponent Rule' };
    }
    function staticQuotientRuleProblem() {
        return { question: 'Use the quotient rule to simplify: $$\\frac{6s^{3}p^{12}}{-3sp^{4}}$$', answer: '-2s^2p^8', prettyAnswer: '-2s<sup>2</sup>p<sup>8</sup>', solution: '<p>Divide coefficients (6 / -3 = -2) and subtract exponents.</p><p>$$s^{3-1} = s^{2}$$</p><p>$$p^{12-4} = p^{8}$$</p><p>Final Answer: $$-2s^{2}p^{8}$$</p>', type: 'Exponent Rule' };
    }
    function generateSimplifyRadicalVariablesProblem() {
        const s = getRandomElement([4, 9, 16, 25, 36]), r = getRandomElement([2, 3, 5]); const n = s * r;
        const vars = shuffleArray(['a', 'b', 'c', 'x', 'y']).slice(0, getRandomInt(2, 3));
        let questionLatex = `${n}`; let answer_out = [Math.sqrt(s)]; let answer_in = [r];
        vars.forEach(v => {
            const p = getRandomInt(2, 9); questionLatex += `${v}^{${p}}`;
            const outExp = Math.floor(p/2), inExp = p % 2;
            if(outExp > 0) answer_out.push(`${v}${outExp > 1 ? `^${outExp}` : ''}`);
            if(inExp > 0) answer_in.push(v);
        });
        const question = `Simplify: $$\\sqrt{${questionLatex}}$$`;
        answer_out.sort(); answer_in.sort();
        const answer = `${answer_out.join('')}√${answer_in.join('')}`;
        const solution = `<p>Simplify the coefficient and each variable separately, then combine.</p><p>Final Answer: $$${answer.replace("√", "\\sqrt{").replace(/\^(\d+)/g, '^{$1}')}$$</p>`;
        return { question, answer, solution, type: 'Simplify Radical' };
    }
    function generateSimplifyRadicalFractionProblem() {
        const d_sqrt = getRandomElement([4, 9, 10]); const d = d_sqrt * d_sqrt; const n_s = getRandomElement([4, 9, 16]); const n_r = getRandomElement([2, 3, 5]); const n = n_s * n_r;
        const question = `Simplify the expression: $$\\sqrt{\\frac{${n}}{${d}}}$$`;
        const n_coeff = Math.sqrt(n_s);
        const answer = `${n_coeff}√${n_r}/${d_sqrt}`;
        const solution = `<p>Apply the square root to the numerator and denominator separately.</p><p>$$\\frac{\\sqrt{${n}}}{\\sqrt{${d}}} = \\frac{\\sqrt{${n_s} \\cdot ${n_r}}}{${d_sqrt}} = \\frac{${n_coeff}\\sqrt{${n_r}}}{${d_sqrt}}$$</p>`;
        return { question, answer, solution, type: 'Simplify Radical' };
    }
    function generateAddSubtractProblem() {
        const s1=getRandomElement([4,9,16]), s2=getRandomElement([4,9,16,25]); const r = getRandomElement([2,3,5]); const n1 = s1*r, n2 = s2*r;
        const c1 = getRandomElement([1,1,2,3,4,8]), c2 = getRandomElement([1,1,2,3,4,6]); const op = getRandomElement(['+','-']);
        const question = `Simplify the expression: $$${c1 === 1 ? '' : c1}\\sqrt{${n1}} ${op} ${c2 === 1 ? '' : c2}\\sqrt{${n2}}$$`;
        const simp_c1 = c1*Math.sqrt(s1), simp_c2 = c2*Math.sqrt(s2);
        let final_c = op === '+' ? simp_c1 + simp_c2 : simp_c1 - simp_c2; if (final_c === 0) final_c = 1;
        const answer = formatRadicalAnswer(final_c, r);
        const solution = `<p>Simplify each term, then combine like radicals: $$${simp_c1}\\sqrt{${r}} ${op} ${simp_c2}\\sqrt{${r}} = ${formatLatexRadical(final_c, r)}$$</p>`;
        return { question, answer, solution, type: 'Radical Operation' };
    }
    function generateMultiplyProblem() {
        const c1 = getRandomElement([1,2,3]), c2 = getRandomElement([1,5,6]); const r1 = getRandomInt(5,10), r2 = getRandomInt(2,12);
        const question = `Multiply and simplify: $$${c1 === 1 ? '' : c1}\\sqrt{${r1}} \\cdot ${c2 === 1 ? '' : c2}\\sqrt{${r2}}$$`;
        const product = r1 * r2; let simpCoeff = 1, simpRad = product;
        const perfectSquares = [144, 100, 81, 64, 49, 36, 25, 16, 9, 4];
        for (const s of perfectSquares) { if (product % s === 0) { simpCoeff = Math.sqrt(s); simpRad = product / s; break; } }
        const answer = formatRadicalAnswer(c1*c2*simpCoeff, simpRad);
        const solution = `<p>Multiply outside and inside parts, then simplify: $$(${c1}\\cdot${c2})\\sqrt{${r1}\\cdot${r2}} = ${c1*c2}\\sqrt{${product}} = ${formatLatexRadical(c1*c2*simpCoeff, simpRad)}$$</p>`;
        return { question, answer, solution, type: 'Radical Operation' };
    }
    function generateNegationExponentProblem() {
        const b = getRandomInt(2, 5), p = getRandomInt(2, 6);
        const question = `Evaluate: $$-${b}^{${p}}$$`;
        const answer = -Math.pow(b, p);
        const solution = `<p>The exponent applies only to the base, not the negative sign: $$-(${b}^{${p}}) = ${answer}$$</p>`;
        return { question, answer: answer.toString(), solution, type: 'Evaluate' };
    }
    function generateNegativeBaseExponentProblem() {
        const p = getRandomInt(20, 500);
        const question = `Evaluate: $$(-1)^{${p}}$$`;
        const answer = p % 2 === 0 ? 1 : -1;
        const solution = `<p>A base of -1 to an even power is 1. A base of -1 to an odd power is -1.</p>`;
        return { question, answer: answer.toString(), solution, type: 'Evaluate' };
    }
    function staticComplexExpressionA(){return{question:'Fully simplify using only positive exponents: $$(\\frac{-8xy^{7} \\cdot x^{3}y^{3}}{2x^{2} \\cdot 2x^{3}y^{4}})^{3}$$',answer:'-8y^18/x^3',prettyAnswer:'-8y<sup>18</sup>/x<sup>3</sup>',solution:"<p><b>Simplify Inside:</b> $$\\frac{-8x^{4}y^{10}}{4x^{5}y^{4}} = -2x^{-1}y^{6}$$</p><p><b>Apply Outer Power:</b> $$(-2x^{-1}y^{6})^{3} = -8x^{-3}y^{18}$$</p><p><b>Positive Exponents:</b> $$\\frac{-8y^{18}}{x^{3}}$$'</p>",type:"Complex Expression"}}
    function staticComplexExpressionB(){return{question:'Fully simplify using only positive exponents: $$(\\frac{(3xy^{5})^{2}}{(x^{2}y^{3})^{3} \\cdot 3x^{4}y^{2}})^{2}$$',answer:'81/(x^16y^2)',prettyAnswer:'81/(x<sup>16</sup>y<sup>2</sup>)',solution:"<p><b>Simplify Numerator:</b> $$(3xy^{5})^{2} = 9x^{2}y^{10}$$</p><p><b>Simplify Denominator:</b> $$(x^{6}y^{9})(3x^{4}y^{2}) = 3x^{10}y^{11}$$</p><p><b>Simplify Fraction:</b> $$\\frac{9x^{2}y^{10}}{3x^{10}y^{11}} = 3x^{-8}y^{-1}$$</p><p><b>Outer Power:</b> $$(3x^{-8}y^{-1})^{2} = 9x^{-16}y^{-2} = \\frac{9}{x^{16}y^{2}}$$'</p>",type:"Complex Expression"}}
    function generateSimpleRadicalProblem() {
        const s = getRandomElement(perfectSquares), r = getRandomElement(primes); const n = s * r;
        const question = `Simplify each radical expression. $$\\sqrt{${n}}$$`;
        const answer = `${Math.sqrt(s)}√${r}`;
        const prettyAnswer = `${Math.sqrt(s)}&radic;${r}`;
        const solution = `<p>$$\\sqrt{${n}} = \\sqrt{${s} \\cdot ${r}} = ${Math.sqrt(s)}\\sqrt{${r}}$$</p>`;
        return { question, answer, prettyAnswer, solution, type: 'Simplify Radical'};
    }
    function staticSimpleDivisionProblem(){return{question:'Perform the indicated operations and, if possible, simplify. $$\\frac{\\sqrt{200}}{\\sqrt{5}}$$',answer:'2√10',prettyAnswer:'2&radic;10',solution:'<p>$$\\sqrt{\\frac{200}{5}} = \\sqrt{40} = \\sqrt{4 \\cdot 10} = 2\\sqrt{10}$$</p>',type:"Radical Operation"}}
    function staticRationalizeDivisionProblem(){return{question:'Perform the indicated operations and, if possible, simplify. $$\\frac{\\sqrt{2}}{\\sqrt{3}}$$',answer:'√6/3',prettyAnswer:'&radic;6/3',solution:'<p>$$\\frac{\\sqrt{2}}{\\sqrt{3}} \\cdot \\frac{\\sqrt{3}}{\\sqrt{3}} = \\frac{\\sqrt{6}}{3}$$</p>',type:"Radical Operation"}}

    // --- QUIZ LOGIC ---
    function generateQuiz() {
        score = 0; questionsAnswered = 0;
        completionContainer.innerHTML = ''; completionContainer.classList.add('hidden');
        const totalProblems = 17;
        updateScoreDisplay();
        
        quizContainer.innerHTML = `<div class="text-center"><p class="text-gray-600" id="progress-text">Generating 0/${totalProblems} new problems...</p><div class="progress-bar"><div id="progress-bar-inner" class="progress-bar-inner"></div></div></div>`;
        const progressText = document.getElementById('progress-text');
        const progressBarInner = document.getElementById('progress-bar-inner');

        const generatorsToCall = [
            generatePowerRuleProblem, generateProductRuleProblem, staticQuotientRuleProblem,
            generateSimplifyRadicalVariablesProblem, generateSimplifyRadicalFractionProblem,
            generateAddSubtractProblem, generateMultiplyProblem, generateNegationExponentProblem,
            generateNegativeBaseExponentProblem, staticComplexExpressionA, staticComplexExpressionB,
            generateSimpleRadicalProblem, generateSimplifyRadicalVariablesProblem, generateAddSubtractProblem,
            generateMultiplyProblem, staticSimpleDivisionProblem, staticRationalizeDivisionProblem,
        ];
        currentQuestions = [];
        
        function generateOneAtATime(index = 0) {
            if (index >= generatorsToCall.length) {
                renderQuiz(shuffleArray(currentQuestions));
                return;
            }
            const generator = generatorsToCall[index];
            currentQuestions.push(generator());
            
            const progress = (currentQuestions.length / totalProblems) * 100;
            if(progressText) progressText.textContent = `Generating ${currentQuestions.length}/${totalProblems} new problems...`;
            if(progressBarInner) progressBarInner.style.width = `${progress}%`;

            setTimeout(() => generateOneAtATime(index + 1), 30);
        }
        setTimeout(generateOneAtATime, 50);
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
            const submitBtn = document.getElementById(`submit-${index}`);
            const answerInput = document.getElementById(`answer-${index}`);
            const checkFunc = () => checkAnswer(index, q.answer, q.prettyAnswer, q.solution);
            submitBtn.addEventListener('click', checkFunc);
            answerInput.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); checkFunc(); } });
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
