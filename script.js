* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background: #0f172a;
  color: white;
}

.app {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background: #111827;
  padding: 30px 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  margin-bottom: 40px;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

nav a {
  color: #cbd5e1;
  text-decoration: none;
  padding: 12px;
  border-radius: 8px;
  transition: 0.3s;
}

nav a:hover {
  background: #1e293b;
}

.main-content {
  flex: 1;
  padding: 30px;
}

header h1 {
  margin-bottom: 30px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background: #1e293b;
  padding: 20px;
  border-radius: 12px;
}

.card h3 {
  margin-bottom: 10px;
  color: #94a3b8;
}

.card p {
  font-size: 28px;
  font-weight: bold;
}

.form-section,
.table-section {
  background: #1e293b;
}
