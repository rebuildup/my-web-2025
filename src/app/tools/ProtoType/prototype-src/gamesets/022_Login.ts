const apiUrl =
  "https://script.google.com/macros/s/AKfycbyVgq9boRy9J0bMhxKAyDfkPXryA45m7tOigWeRBkVAxQmyzsogxPWEv5mf8TtprdR8/exec";

export async function checkUsername(username: string): Promise<number> {
  const url = `${apiUrl}?action=checkUsername&username=${encodeURIComponent(
    username
  )}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

export async function checkPassword(
  id: number,
  password: string
): Promise<boolean> {
  const url = `${apiUrl}?action=checkPassword&id=${id}&password=${encodeURIComponent(
    password
  )}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

export async function createUser(
  username: string,
  password: string
): Promise<number> {
  const url = `${apiUrl}?action=createUser&username=${encodeURIComponent(
    username
  )}&password=${encodeURIComponent(password)}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

export async function fetchPlayerData(playerId: string): Promise<any> {
  // Replace with your deployed App Script web app URL
  const endpoint =
    "https://script.google.com/macros/s/AKfycbwFo9EeP6-wrvmPjUL5kPaC86u2gnzKpXA8-Pts2KWhTYj6ZxVGiQHu4ppMEn8x3DEV/exec";
  const url = `${endpoint}?id=${encodeURIComponent(playerId)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching player data:", error);
    throw error;
  }
}
/*
// Example usage:
fetchPlayerData("example_player_id")
  .then((data) => {
    console.log("Player data:", data);
  })
  .catch((error) => {
    console.error("Failed to fetch player data:", error);
  });
*/
/*
(async () => {
  const username = "exampleUser";
  const password = "examplePass";

  // Check if the username exists
  const id = await checkUsername(username);
  if (id === -1) {
    console.log("Username not found. Creating new user...");
    const newId = await createUser(username, password);
    console.log("New user created with ID:", newId);
  } else {
    console.log("User found with ID:", id);
    const isValid = await checkPassword(id, password);
    if (isValid) {
      console.log("Password is correct.");
    } else {
      console.log("Incorrect password.");
    }
  }
})();
*/

