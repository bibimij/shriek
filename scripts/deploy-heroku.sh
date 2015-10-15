echo 'Heroku deploy'

cat "{\"port\": 3000, \"mongoose\": {\"uri\": \"$MONGO_LINK\"}}" > config.json
