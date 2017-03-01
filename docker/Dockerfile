# echo-gold
# Version 1.0.0
#
FROM node

MAINTAINER rongkai rongkaixia@gmail.com

# Install
ENV ECHO_GOLD_HOME /opt/echo-gold
ADD echo-gold.tar $ECHO_GOLD_HOME/
RUN cd $ECHO_GOLD_HOME && npm install

CMD ["/bin/sh", "-c", "cd $ECHO_GOLD_HOME; npm start"]
