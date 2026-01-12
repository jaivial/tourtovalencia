module.exports = {
    apps: [{
        name: "tourtovalencia",
        script: "remix-serve",
        args: "./build/server/index.js",
        env: {
            NODE_ENV: "production",
            PORT: "3001"
        },
        watch: false,
        max_memory_restart: "2G",
        exec_mode: "fork",
        instances: 1,
        autorestart: true,
        max_restarts: 10,
        min_uptime: "10s",
        kill_timeout: 5000,
        wait_ready: true,
        listen_timeout: 10000,
        shutdown_with_message: true
    }]
}; 