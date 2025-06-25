
cd backend
docker build -t resume-backend .

cd ../resume-editor
docker build -t resume-frontend .

cd ..

docker-compose up
