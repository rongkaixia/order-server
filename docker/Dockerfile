# echo-gold
# Version 1.0.0
#
FROM node:4.2.3

MAINTAINER rongkai rongkaixia@gmail.com

# Install
ENV ECHO_GOLD_HOME /opt/echo-gold
ADD echo-gold.tar $ECHO_GOLD_HOME/
ADD node_modules_linux.tar $ECHO_GOLD_HOME/
RUN cd $ECHO_GOLD_HOME && npm install && npm run build

CMD ["/bin/sh", "-c", "cd $ECHO_GOLD_HOME; npm start"]
