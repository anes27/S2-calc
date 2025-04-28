
        const subjects = [
            { name: 'Analysis', coef: 5, hasTD: true },
            { name: 'OOP', coef: 4, hasTD: true },
            { name: 'Logic', coef: 4, hasTD: true },
            { name: 'Proba', coef: 4, hasTD: true },
            { name: 'ISI', coef: 3, hasTD: true },
            { name: 'Optics', coef: 3, hasTD: true },
            { name: 'English', coef: 2, hasTD: true },
            { name: 'Project', coef: 4, hasTD: false }
        ];

        // Show welcome modal on load
        window.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                document.getElementById('welcomeOverlay').classList.add('show');
            }, 500);
        });

        // Close welcome modal
        function closeWelcome() {
            document.getElementById('welcomeOverlay').classList.remove('show');
        }

        const tableBody = document.getElementById('subjectsTable');

        // Populate table with subjects
        subjects.forEach((subj, index) => {
            const row = document.createElement('tr');
            row.className = 'row-animation';
            row.style.animationDelay = `${index * 0.1}s`;

            row.innerHTML = `
    <td data-label="Subject">${subj.name}</td>
    <td data-label="Credits">${subj.coef}</td>
    <td data-label="Practical">
      ${subj.hasTD ?
                    `<input type="number" min="0" max="20" step="0.25" id="td-${index}" onkeydown="handleKeyDown(event)" placeholder="0-20">`
                    : '-'}
    </td>
    <td data-label="Exam">
      <input type="number" min="0" max="20" step="0.25" id="exam-${index}" onkeydown="handleKeyDown(event)" placeholder="0-20">
    </td>
  `;

            tableBody.appendChild(row);
        });

        // Function to handle Enter key navigation
        function handleKeyDown(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                const inputs = Array.from(document.querySelectorAll('input[type="number"]'));
                const index = inputs.indexOf(event.target);
                if (index !== -1 && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                } else if (index === inputs.length - 1) {
                    // If at the last input, trigger the calculate function
                    calculateGrades();
                }
            }
        }

        // Add input validation to prevent values > 20
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('input', function () {
                if (this.value > 20) {
                    this.value = 20;
                }
            });
        });

        // Create individual notification
        function createNotification(message) {
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.innerHTML = `
    <div class="notification-content">${message}</div>
    <button class="notification-close" onclick="closeNotification(this)">&times;</button>
  `;

            document.getElementById('notificationsContainer').appendChild(notification);

            // Auto-close after 5 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    closeNotification(notification.querySelector('.notification-close'));
                }
            }, 5000);
        }

        // Close individual notification
        function closeNotification(closeBtn) {
            const notification = closeBtn.parentNode;
            notification.classList.add('closing');

            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }

        // Calculate grades and show results
        function calculateGrades() {
            let totalWeighted = 0;
            let totalCoef = 0;
            let missingInputs = [];

            // Check for missing inputs
            subjects.forEach((subj, index) => {
                const examInput = document.getElementById(`exam-${index}`);
                const examValue = examInput.value.trim();

                if (examValue === '') {
                    missingInputs.push({
                        type: 'exam',
                        subject: subj.name
                    });
                }

                if (subj.hasTD) {
                    const tdInput = document.getElementById(`td-${index}`);
                    const tdValue = tdInput.value.trim();

                    if (tdValue === '') {
                        missingInputs.push({
                            type: 'td',
                            subject: subj.name
                        });
                    }
                }
            });

            // Show individual notifications for missing inputs
            missingInputs.forEach((item, index) => {
                setTimeout(() => {
                    const message = `You forgot to fill the ${item.subject} ${item.type === 'td' ? 'TD' : 'exam'} grade.`;
                    createNotification(message);
                }, index * 300); // Stagger notifications by 300ms
            });

            // Calculate anyway but with zeros for missing inputs
            let resultsHTML = `
    <table class="results-table">
      <thead>
        <tr>
          <th>Subject</th>
          <th>Coefficient</th>
          <th>Final Grade</th>
        </tr>
      </thead>
      <tbody>
  `;

            subjects.forEach((subj, index) => {
                let subjectGrade = 0;
                const exam = parseFloat(document.getElementById(`exam-${index}`).value) || 0;

                if (subj.hasTD) {
                    const td = parseFloat(document.getElementById(`td-${index}`).value) || 0;
                    subjectGrade = td * 0.4 + exam * 0.6; // 40% Practical + 60% Exam
                } else {
                    subjectGrade = exam; // For subject with no practical, grade is just the exam
                }

                totalWeighted += subjectGrade * subj.coef;
                totalCoef += subj.coef;

                const gradeClass = subjectGrade >= 10 ? 'passed' : 'failed';

                resultsHTML += `
      <tr class="animate__animated animate__fadeIn" style="animation-delay: ${index * 0.15}s">
        <td data-label="Subject">${subj.name}</td>
        <td data-label="Coefficient">${subj.coef}</td>
        <td data-label="Final Grade" class="${gradeClass}">${subjectGrade.toFixed(2)}</td>
      </tr>
    `;
            });

            resultsHTML += `</tbody></table>`;

            const avg = totalWeighted / totalCoef;
            const passStatus = avg >= 10 ? 'PASSED' : 'FAILED';
            const statusClass = avg >= 10 ? 'passed' : 'failed';

            resultsHTML += `
    <div class="general-average ${statusClass} animate__animated animate__fadeInUp">
      Overall GPA: ${avg.toFixed(2)} - ${passStatus}
    </div>
  `;

            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = resultsHTML;
            resultDiv.classList.add('show');

            // Scroll to results
            setTimeout(() => {
                resultDiv.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    
