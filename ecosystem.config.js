module.exports = {
    apps: [{
        name: "tourtovalencia",
        script: "npm",
        args: "start",
        env: {
            NODE_ENV: "production",
            PORT: "3001"
        },
        watch: false,
        max_memory_restart: "1G",
        exec_mode: "fork",
        instances: 1,
        autorestart: true
    }]
}; 