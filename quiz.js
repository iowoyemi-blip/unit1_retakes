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
        const c = getRandomElement([-5, -4, -3, -2]);
        const p = 2;
        const vars = shuffleArray(['x','y','z','a','b']).slice(0,2);
        const question = `Use the power rule to simplify: $$(${c}${vars[0]}${vars[1]})^{${p}}$$`;
        const answer = `${Math.pow(c,p)}${vars[0]}^${p}${vars[1]}^${p}`;
        const solution = `<p>Apply the exponent to each factor inside: $$(${c})^{${p}}(${vars[0]})^{${p}}(${vars[1]})^{${p}} = ${answer}$$</p>`;
        return { question, answer, solution, type: 'Exponent Rule' };
    }
    function generateProductRuleProblem() {
        const c1 = getRandomInt(-5, 5);
        const c2 = getRandomInt(2, 5);
        const [v1, v2] = shuffleArray(['x','y','z','a','b']).slice(0,2);
        const p1 = getRandomInt(2,5), p2 = getRandomInt(2,5), p3 = getRandomInt(2,5), p4 = getRandomInt(2,5);
        const question = `Use the product rule to simplify: $$(${c1}${v1}^{${p1}}${v2}^{${p2}}) \\cdot (${c2}${v1}^{${p3}}${v2}^{${p4}})$$`;
        const answer = `${c1*c2}${v1}^${p1+p3}${v2}^${p2+p4}`;
        const solution = `<p>Multiply coefficients and add exponents of like bases: $$(${c1} \\cdot ${c2})(${v1}^{${p1}+${p3}})(${v2}^{${p2}+${p4}}) = ${answer}$$</p>`;
        return { question, answer, solution, type: 'Exponent Rule' };
    }
    function generateQuotientRuleProblem() {
        const c2 = getRandomInt(2, 5) * -1;
        const m = getRandomInt(2, 6);
        const c1 = c2 * m * -1;
        const [v1, v2] = ['s', 'p'];
        const p3 = getRandomInt(1, 4), p4 = getRandomInt(2, 8);
        const p1 = p3 + getRandomInt(1, 4), p2 = p4 + getRandomInt(2, 5);
        const question = `Use the quotient rule to simplify: $$\\frac{${c1}${v1}^{${p1}}${v2}^{${p2}}}{${c2}${v1}^{${p3}}${v2}^{${p4}}}$$`;
        const c_ans = c1/c2, p1_ans = p1-p3, p2_ans = p2-p4;
        const answer = `${c_ans}${v1}${p1_ans > 1 ? `^${p1_ans}` : ''}${v2}^${p2_ans}`;
        const solution = `<p>Divide coefficients and subtract exponents of like bases: $$(\\frac{${c1}}{${c2}})${v1}^{${p1}-${p3}}${v2}^{${p2}-${p4}} = ${answer}$$</p>`;
        return { question, answer, solution, type: 'Exponent Rule' };
    }
    function generateSimplifyRadicalVariablesProblem() {
        const s = getRandomElement([4, 9, 16, 25, 36]);
        const r = getRandomElement([2, 3, 5]);
        const n = s * r;
        const vars = shuffleArray(['a', 'b', 'c', 'x', 'y']).slice(0, getRandomInt(2, 3));
        let questionLatex = `${n}`;
        let answer_out = [Math.sqrt(s)];
        let answer_in = [r];
        vars.forEach(v => {
            const p = getRandomInt(2, 9);
            questionLatex += `${v}^{${p}}`;
            const outExp = Math.floor(p/2), inExp = p % 2;
            if(outExp > 0) answer_out.push(`${v}${outExp > 1 ? `^${outExp}` : ''}`);
            if(inExp > 0) answer_in.push(v);
        });
        const question = `Simplify: $$\\sqrt{${questionLatex}}$$`;
        answer_out.sort();
        answer_in.sort();
        const answer = `${answer_out.join('')}√${answer_in.join('')}`;
        const solution = `<p>Simplify the coefficient and each variable separately, then combine.</p><p>Final Answer: $$${answer.replace("√", "\\sqrt{").replace(/\^(\d+)/g, '^{$1}')}$$</p>`;
        return { question, answer, solution, type: 'Simplify Radical' };
    }
    function generateSimplifyRadicalFractionProblem() {
        const d_sqrt = getRandomElement([4, 9]);
        const d = d_sqrt * d_sqrt;
        const n_s = getRandomElement([4, 9]), n_r = getRandomElement([2, 3, 5]);
        const n = n_s * n_r, n_coeff = Math.sqrt(n_s);
        const question = `Simplify the expression: $$\\sqrt{\\frac{${n}}{${d}}}$$`;
        const answer = `${n_coeff}√${n_r}/${d_sqrt}`;
        const solution = `<p>Apply the square root to the numerator and denominator separately.</p><p>$$\\frac{\\sqrt{${n}}}{\\sqrt{${d}}} = \\frac{${n_coeff}\\sqrt{${n_r}}}{${d_sqrt}}$$</p>`;
        return { question, answer, solution, type: 'Simplify Radical' };
    }
    function generateAddSubtractProblem() {
        const s1=getRandomElement([4,9,16]), s2=getRandomElement([4,9,16,25]);
        const r = getRandomElement([2,3,5]);
        const n1 = s1*r, n2 = s2*r;
        const c1 = getRandomElement([1,1,1,2,3,4,8]), c2 = getRandomElement([1,1,1,2,3,4,6]);
        const op = getRandomElement(['+','-']);
        const question = `Simplify the expression: $$${c1 === 1 ? '' : c1}\\sqrt{${n1}} ${op} ${c2 === 1 ? '' : c2}\\sqrt{${n2}}$$`;
        const simp_c1 = c1*Math.sqrt(s1), simp_c2 = c2*Math.sqrt(s2);
        const final_c = op === '+' ? simp_c1 + simp_c2 : simp_c1 - simp_c2;
        const answer = formatRadicalAnswer(final_c, r);
        const solution = `<p>Simplify each term, then combine like radicals: $$${simp_c1}\\sqrt{${r}} ${op} ${simp_c2}\\sqrt{${r}} = ${formatLatexRadical(final_c, r)}$$</p>`;
        return { question, answer, solution, type: 'Radical Operation' };
    }
    function generateMultiplyProblem() {
        const c1 = getRandomElement([1,2,3]), c2 = getRandomElement([1,5,6]);
        const r1 = getRandomInt(5,10), r2 = getRandomInt(2,12);
        const question = `Multiply and simplify: $$${c1 === 1 ? '' : c1}\\sqrt{${r1}} \\cdot ${c2 === 1 ? '' : c2}\\sqrt{${r2}}$$`;
        const product = r1 * r2;
        let simpCoeff = 1, simpRad = product;
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
    function generateComplexExpressionProblem() {
        const c1 = getRandomInt(-8, -2), c2 = getRandomInt(2, 4), c3 = getRandomInt(2, 4);
        const x1=getRandomInt(1,2), x2=getRandomInt(2,4), x3=getRandomInt(2,3), x4=getRandomInt(2,4), y1=getRandomInt(2,5), y2=getRandomInt(2,5), y3=getRandomInt(2,3), y4=getRandomInt(2,4);
        const p_outer = getRandomInt(2,3);
        const question = `Simplify using only positive exponents: $$(\\frac{${c1}x^{${x1}}y^{${y1}} \\cdot x^{${x2}}y^{${y2}}}{${c2}x^{${x3}} \\cdot ${c3}x^{${x4}}y^{${y4}}})^{${p_outer}}$$`;
        const num_c = c1, num_x = x1+x2, num_y = y1+y2, den_c = c2*c3, den_x = x3+x4, den_y = y4;
        const mid_x = num_x - den_x, mid_y = num_y - den_y;
        const final_x = mid_x * p_outer, final_y = mid_y * p_outer;
        const final_c_num = Math.pow(num_c, p_outer), final_c_den = Math.pow(den_c, p_outer);
        let num_parts = [], den_parts = [];
        const gcd = (a, b) => b === 0 ? a : gcd(Math.abs(a), Math.abs(b));
        const common = gcd(final_c_num, final_c_den);
        let simp_num = final_c_num / common, simp_den = final_c_den / common;
        if (simp_den < 0) { simp_num *= -1; simp_den *= -1; }
        num_parts.push(simp_num);
        if (simp_den !== 1) den_parts.push(simp_den);
        if (final_x > 0) num_parts.push(`x^${final_x}`); else if (final_x < 0) den_parts.push(`x^${-final_x}`);
        if (final_y > 0) num_parts.push(`y^${final_y}`); else if (final_y < 0) den_parts.push(`y^${-final_y}`);
        const answer = den_parts.length > 0 ? `${num_parts.join('')}/${den_parts.join('')}` : num_parts.join('');
        const solution = `<p>Simplify inside the parentheses first, then apply the outer power and ensure all exponents are positive.</p>`;
        return { question, answer, solution, type: 'Complex Expression' };
    }
    function generateSimpleDivisionProblem() {
        const primes = [2, 3, 5, 7], perfect_squares = [4, 9, 16, 25];
        const q_s = getRandomElement(perfect_squares), q_r = getRandomElement(primes);
        const q = q_s * q_r, d = getRandomElement([2, 3, 4, 5]), n = q * d;
        const question = `Perform the operation and simplify: $$\\frac{\\sqrt{${n}}}{\\sqrt{${d}}}$$`;
        const simp_coeff = Math.sqrt(q_s);
        const answer = formatRadicalAnswer(simp_coeff, q_r);
        const latexAnswer = formatLatexRadical(simp_coeff, q_r);
        const solution = `<p>Combine into one radical, simplify the fraction, then simplify the resulting radical.</p><p>$$\\sqrt{\\frac{${n}}{${d}}} = \\sqrt{${q}} = \\sqrt{${q_s} \\cdot ${q_r}} = ${latexAnswer}$$</p>`;
        return { question, answer: answer.toString(), solution, type: 'Radical Operation' };
    }
    function generateRationalizeDivisionProblem() {
        let n, d; const n_pool = [2,3,5,7], d_pool = [2,3,5,7,11,13];
        do { n = getRandomElement(n_pool); d = getRandomElement(d_pool); } while (n === d);
        const question = `Perform the operation and simplify: $$\\frac{\\sqrt{${n}}}{\\sqrt{${d}}}$$`;
        const answer = `√${n*d}/${d}`;
        const solution = `<p>Rationalize the denominator: $$\\frac{\\sqrt{${n}}}{\\sqrt{${d}}} \\cdot \\frac{\\sqrt{${d}}}{\\sqrt{${d}}} = \\frac{\\sqrt{${n*d}}}{${d}}$$'</p>`;
        return { question, answer, solution, type: 'Radical Operation' };
    }
    function generateSimpleRadicalProblem() {
        const s = getRandomElement(perfectSquares);
        const r = getRandomElement(primes);
        const n = s * r;
        const question = `Simplify each radical expression. $$\\sqrt{${n}}$$`;
        const answer = `${Math.sqrt(s)}√${r}`;
        const prettyAnswer = `${Math.sqrt(s)}&radic;${r}`;
        const solution = `<p>$$\\sqrt{${n}} = \\sqrt{${s} \\cdot ${r}} = ${Math.sqrt(s)}\\sqrt{${r}}$$</p>`;
        return { question, answer, prettyAnswer, solution, type: 'Simplify Radical'};
    }

    // --- QUIZ LOGIC (Fully Asynchronous, one question at a time) ---
    function generateQuiz() {
        score = 0; questionsAnswered = 0;
        completionContainer.innerHTML = ''; completionContainer.classList.add('hidden');
        const totalProblems = 17;
        updateScoreDisplay();
        
        quizContainer.innerHTML = `<div class="text-center"><p class="text-gray-600" id="progress-text">Generating 0/${totalProblems} new problems...</p><div class="progress-bar"><div id="progress-bar-inner" class="progress-bar-inner"></div></div></div>`;
        const progressText = document.getElementById('progress-text');
        const progressBarInner = document.getElementById('progress-bar-inner');

        const generatorsToCall = [
            generatePowerRuleProblem, generateProductRuleProblem, generateQuotientRuleProblem,
            generateSimplifyRadicalVariablesProblem, generateSimplifyRadicalFractionProblem,
            generateAddSubtractProblem, generateMultiplyProblem, generateNegationExponentProblem,
            generateNegativeBaseExponentProblem, generateComplexExpressionProblem, generateComplexExpressionProblem,
            generateSimpleRadicalProblem, generateSimplifyRadicalVariablesProblem, generateAddSubtractProblem,
            generateMultiplyProblem, generateSimpleDivisionProblem, generateRationalizeDivisionProblem,
        ];
        currentQuestions = [];
        
        function generateOneAtATime(index = 0) {
            if (index >= generatorsToCall.length) {
                renderQuiz(shuffleArray(currentQuestions));
                return;
            }
            // Generate just one problem
            const generator = generatorsToCall[index];
            const problem = generator();
            currentQuestions.push(problem);
            
            // Update the progress bar UI
            const progress = (currentQuestions.length / totalProblems) * 100;
            if(progressText) progressText.textContent = `Generating ${currentQuestions.length}/${totalProblems} new problems...`;
            if(progressBarInner) progressBarInner.style.width = `${progress}%`;

            // Schedule the next problem to be generated after a tiny delay
            setTimeout(() => generateOneAtATime(index + 1), 30);
        }
        // Start the generation process
        setTimeout(generateOneAtATime, 50);
    }
    function renderQuiz(questions) {
        const cardsHTML = questions.map((q, index) => {
            const placeholder = 'Enter your simplified answer';
            return `<div class="bg-white p-6 rounded-lg shadow-md"><div class="flex justify-between items-start"><div class="text-lg font-medium text-gray-800 pr-4"><span class="font-bold mr-2">${index + 1}.</span> ${q.question}</div><span class="flex-shrink-0 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${q.type}</span></div><div class="mt-4 flex flex-col sm:flex-row sm:items-center"><div class="relative flex-grow"><input type="text" id="answer-${index}" class="w-full pl-4 pr-24 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="${placeholder}"><div class="absolute top-1/2 right-1 transform -translate-y-1/2"><button class="h-8 w-8 text-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-sans rounded-md" onclick="insertSymbol('√', 'answer-${index}')">√</button><button class="h-8 w-8 text-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-sans rounded-md ml-1" onclick="insertSymbol('^', 'answer-${index}')">xʸ</button></div></div><button id="submit-${index}" class="mt-2 sm:mt-0 sm:ml-2 w-full sm:w-auto px-6 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600">Submit</button></div><div id="solution-${index}" class="hidden mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">${q.solution}</div></div>`;
        }).join('');

        quizContainer.innerHTML = cardsHTML;
        
        try {
            MathJax.typesetPromise();
        } catch (e) { console.error("MathJax rendering failed but quiz is functional.", e); }

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
    
    // This needs to be globally accessible for the inline HTML onclick
    window.insertSymbol = function(symbol, inputId) {
        const input = document.getElementById(inputId);
        const start = input.selectionStart;
        const end = input.selectionEnd;
        input.value = input.value.substring(0, start) + symbol + input.value.substring(end);
        input.focus();
        input.setSelectionRange(start + 1, start + 1);
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