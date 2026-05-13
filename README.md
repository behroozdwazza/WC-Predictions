# World Cup 2026 Prediction Contest

A small self-hosted web app for a private FIFA World Cup 2026 prediction contest.

## Run locally

```powershell
npm start
```

Open `http://localhost:3000`.

## Accounts and admin

Players create an account with a username, password, and screen name. They can sign back in each day and update predictions until kickoff.

The default admin login is:

- username: `admin`
- password: `worldcup-admin`

Set real admin credentials before sharing:

```powershell
$env:ADMIN_USERNAME="admin"
$env:ADMIN_PASSWORD="choose-a-private-password"
npm start
```

Admins can add fixtures, import a JSON fixture list, enter final scores, and edit or delete player accounts. Rankings update as soon as an admin saves a final score.

## Scoring

Group stage:

- exact score: 10
- correct outcome and goal difference: 7
- correct winner only: 4
- wrong winner/draw shape: 0
- no prediction after a finished match: -2

Knockout stage:

- predictions use the score after 120 minutes
- if the predicted score is a draw, the player must choose a penalty winner
- points scale by round and follow the supplied knockout table
