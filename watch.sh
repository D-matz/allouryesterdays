curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'Authorization: Basic cmlvdDp4X1ZuaVNDRVp3OVpGMXk0aHZQUUNR' -d '{
  "componentType": "string"
}' 'https://127.0.0.1:62477/lol-replays/v1/rofls/'$LOLGAMEID'/download' -k


sleep 15

curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'Authorization: Basic cmlvdDp4X1ZuaVNDRVp3OVpGMXk0aHZQUUNR' -d '{
  "componentType": "string"
}' 'https://127.0.0.1:62477/lol-replays/v1/rofls/'$LOLGAMEID'/watch' -k
