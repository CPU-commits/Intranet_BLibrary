import { registerAs } from '@nestjs/config'

enum NodeEnv {
    'dev',
    'prod',
}

export default registerAs('config', () => {
    const nodeEnv = process.env.NODE_ENV as keyof typeof NodeEnv
    return {
        port: parseInt(process.env.PORT, 10),
        mongo: {
            dbName: process.env.MONGO_DB,
            host: process.env.MONGO_HOST,
            user: process.env.MONGO_ROOT_USERNAME,
            password: process.env.MONGO_ROOT_PASSWORD,
            port: parseInt(process.env.MONGO_PORT, 10),
            connection: process.env.MONGO_CONNECTION,
        },
        jwtSecret: process.env.JWT_SECRET_KEY,
        node_env: nodeEnv,
        aws: {
            bucket: process.env.AWS_BUCKET,
        },
        nats: process.env.NATS_HOST,
        els_node: process.env.ELASTICSEARCH_NODE,
        client_url: process.env.CLIENT_URL,
    }
})
