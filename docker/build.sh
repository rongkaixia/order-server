
tar -czf echo-gold.tar .. --exclude docker
sudo docker build -t echo-gold:1.0.0 .