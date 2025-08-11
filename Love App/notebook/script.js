const card = document.getElementById("card");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const totalNotes = 50;
let currentNote = 0;

const loveNotes = [
  "Te iubesc cel mai mult",
  "Esti cea mai importanta pt mine",
  "Tu ai inima mea",
  "Esti cea mai frumoasa",
  "In ochii mei esti doar tu",
  "Ma gandesc la tine mereu",
  "Ai un loc special in inima mea",
  "Sunt cel mai mandru de tine",
  "Te sustin cel mai mult",
  "Sunt aici pt tine mereu",
  "Te voi asculta mereu cu ce ai de zis",
  "Ma simt cel mai norocos sa te am",
  "Ma faci cel mai fericit",
  "Ma simt mereu bine cu tine",
  "Esti tot ceea ce mi doresc",
  "Mi ai adus culoare in viata",
  "Iubirea ta e sentimentul meu preferat",
  "Vocea ta e sunetul meu preferat",
  "Ai cei mai frumosi ochi",
  "Ai cel mai frumos zambet",
  "Te ador cel mai mult",
  "Iubesc atingerea ta",
  "Numele tau e cuvantul meu preferat",
  "De abia astept sa ai numele meu",
  "Imi doresc un viitor cu tine",
  "O sa avem cei mai frumosi copii",
  "Iubesc imbratisarile tale",
  "Iubesc rasul tau",
  "Ma faci sa zambesc mereu",
  "Ma ajuti si in momentele proaste",
  "Ma bucur ca esti mereu alaturi de mine",
  "Ma simt in liniste cu tine",
  "Ador ca nu ma judeci niciodata",
  "Ma simt acasa atunci cand sunt cu tine",
  "Tu esti locul meu preferat",
  "Ma faci sa rad mereu",
  "Ai grija de mine mereu, iubesc asta",
  "Te as alege in locul la orice",
  "Imi vad viitorul nostru in ochii tai",
  "Imi arati mereu ca ti pasa",
  "Ai rabdare cu mine mereu",
  "Te iubesc din orice punct de vedere",
  "Iubesc atat de multe lucruri la tine",
  "Pot umple o carte cu tot ce simt pt tine",
  "Te as alege mereu in fiecare viata",
  "Nu ai defecte",
  "Orice la tine este perfect",
  "Cand esti bine, sunt si eu",
  "Iubesc fiecare iesire cu tine",
  "Tu faci fiecare zi sa fie mai buna"
];

function getNoteText(index) {
  return loveNotes[index % loveNotes.length];
}

function updateCard() {
  card.style.transform = 'rotateY(90deg)';
  setTimeout(() => {
    card.querySelector('.card-title').textContent = `Note ${currentNote + 1}`;
    card.querySelector('.card-text').textContent = getNoteText(currentNote);
    card.style.transform = 'rotateY(0deg)';
  }, 400);
}

function updateButtons() {
  prevBtn.disabled = currentNote === 0;
  nextBtn.disabled = currentNote === totalNotes - 1;
}

prevBtn.addEventListener("click", () => {
  if (currentNote > 0) {
    currentNote--;
    updateCard();
    updateButtons();
  }
});

nextBtn.addEventListener("click", () => {
  if (currentNote < totalNotes - 1) {
    currentNote++;
    updateCard();
    updateButtons();
  }
});

// Initialize
updateCard();
updateButtons();
