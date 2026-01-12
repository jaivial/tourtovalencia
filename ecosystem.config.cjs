module.exports = {
    apps: [{
        name: "tourtovalencia",
        script: "npm",
        args: "start",
        env: {
            NODE_ENV: "production",
            PORT: "3010"
        },
        wait_ready: false,
        watch: false,
        exec_mode: "fork",
        instances: 1,
        max_memory_restart: "2G",
        autorestart: true
    }]
}; 