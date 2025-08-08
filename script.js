const similarChars = /[ilLIoO0]/g;

function updateLength(val) {
  document.getElementById("lengthValue").textContent = val;
}

function generatePassword() {
  const length = parseInt(document.getElementById("length").value);
  const useUpper = document.getElementById("uppercase").checked;
  const useLower = document.getElementById("lowercase").checked;
  const useNumbers = document.getElementById("numbers").checked;
  const useSymbols = document.getElementById("symbols").checked;
  const excludeSimilar = document.getElementById("exclude").checked;

  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+[]{}|;:,.<>?";

  let chars = "";
  if (useUpper) chars += upper;
  if (useLower) chars += lower;
  if (useNumbers) chars += numbers;
  if (useSymbols) chars += symbols;

  if (excludeSimilar) {
    chars = chars.replace(similarChars, "");
  }

  if (!chars.length) {
    alert("Please select at least one character set.");
    return;
  }

  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);

  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length];
  }

  document.getElementById("password").value = password;
  evaluateStrength(password);
}

function evaluateStrength(pwd) {
  let score = 0;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (pwd.length >= 12) score++;
  if (pwd.length >= 16) score++;

  const strengthText = document.getElementById("strengthText");
  const strengthBar = document.getElementById("strengthBar");

  if (score <= 2) {
    strengthText.textContent = "Weak";
    strengthBar.style.width = "30%";
    strengthBar.style.background = "red";
  } else if (score <= 4) {
    strengthText.textContent = "Medium";
    strengthBar.style.width = "60%";
    strengthBar.style.background = "orange";
  } else {
    strengthText.textContent = "Strong";
    strengthBar.style.width = "100%";
    strengthBar.style.background = "green";
  }
}

async function isPwned(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fullHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

    const prefix = fullHash.substring(0, 5);
    const suffix = fullHash.substring(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    const text = await response.text();
    const lines = text.split('\n');

    for (let line of lines) {
        const [returnedSuffix, count] = line.trim().split(':');
        if (returnedSuffix.toUpperCase() === suffix) {
            return parseInt(count, 10); // Nombre de fois leaké
        }
    }

    return 0; // Pas trouvé
}
