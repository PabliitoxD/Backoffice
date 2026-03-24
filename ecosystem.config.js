module.exports = {
  apps: [
    {
      name: "backoffice-api",
      script: "npm",
      args: "run start:prod",
      cwd: "backend",
      env: {
        PORT: 3001, // Default backend port
      }
    },
    {
      name: "backoffice-web",
      script: "npm",
      args: "start",
      cwd: "frontend",
      env: {
        PORT: 3000, // Default frontend port
      }
    }
  ]
};
