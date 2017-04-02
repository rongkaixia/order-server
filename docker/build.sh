if [ ! -f ./echo-gold.tar ]
then
    tar -czf echo-gold.tar .. --exclude docker --exclude node_modules
fi
sudo docker build -t echo-gold:1.0.0 .
