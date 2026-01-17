module.exports = {
  apps: [{
    name: "tourtovalencia",
    script: "npm",
    args: "start",
    cwd: "/var/www/tourtovalencia",
    env: {
      NODE_ENV: "production",
      PORT: 3004
    }
  }]
};
