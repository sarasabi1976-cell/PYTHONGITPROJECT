const questions = [
  {
    q: 'A sorted array has 1,024 elements. What is the maximum number of comparisons binary search needs?',
    a: ['10', '32', '512', '1,024'],
    correct: 0,
    why: 'Binary search halves the search space each step. log₂(1,024) = 10.'
  },
  {
    q: 'Which data structure is best suited for checking whether a value has been seen before in average O(1) time?',
    a: ['Linked list', 'Hash set', 'Binary tree', 'Queue'],
    correct: 1,
    why: 'A hash set provides average constant-time membership checks.'
  },
  {
    q: 'What does a stable sorting algorithm guarantee?',
    a: [
      'It always runs in O(n log n)',
      'Equal items keep their original relative order',
      'It sorts in place',
      'It uses no extra memory'
    ],
    correct: 1,
    why: 'Stability preserves the original order of items that compare as equal.'
  }
];

let questionIndex = 0;
let score = 0;

function loadQuestion() {
  const question = questions[questionIndex];

  document.querySelector('#quiz-question').textContent = question.q;
  document.querySelector('#quiz-count').textContent =
    `QUESTION ${questionIndex + 1} OF ${questions.length}`;

  document.querySelector('#quiz-options').innerHTML = question.a
    .map((answer, index) =>
      `<button class="choice" onclick="answer(${index})">${String.fromCharCode(65 + index)}　${answer}</button>`
    )
    .join('');

  document.querySelector('#quiz-feedback').innerHTML = '';
  document.querySelector('#quiz-next').hidden = true;
  document.querySelector('#quiz-progress').style.width =
    `${questionIndex / questions.length * 100}%`;
}

function answer(selectedIndex) {
  const question = questions[questionIndex];
  const buttons = document.querySelectorAll('#quiz-options .choice');

  buttons[selectedIndex].classList.add(
    selectedIndex === question.correct ? 'selected' : ''
  );

  if (selectedIndex === question.correct) {
    score++;
  }

  document.querySelector('#quiz-feedback').innerHTML =
    `<b>${selectedIndex === question.correct ? 'Correct.' : 'Not quite.'}</b> ${question.why}`;

  document.querySelector('#quiz-next').hidden = false;
}

function nextQuestion() {
  questionIndex++;

  if (questionIndex === questions.length) {
    document.querySelector('#quiz-question').textContent =
      `${score} / ${questions.length} — ${
        score === questions.length ? 'Clean sweep!' : 'Good reps. Keep going.'
      }`;

    document.querySelector('#quiz-options').innerHTML = '';
    document.querySelector('#quiz-feedback').textContent =
      'Your answers have been added to your practice history.';

    const nextButton = document.querySelector('#quiz-next');
    nextButton.textContent = 'Try again';
    nextButton.onclick = () => {
      questionIndex = 0;
      score = 0;
      loadQuestion();
    };

    return;
  }

  loadQuestion();
}

if (document.querySelector('#quiz-question')) {
  loadQuestion();
}