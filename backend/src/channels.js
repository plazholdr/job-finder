module.exports = function(app) {
  if(typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return;
  }

  app.on('connection', connection => {
    // On a new real-time connection, add it to the anonymous channel
    app.channel('anonymous').join(connection);
  });

  app.on('login', (authResult, { connection }) => {
    // connection can be undefined if there is no
    // real-time connection, e.g. when logging in via REST
    if(connection) {
      // Obtain the logged in user from the connection
      const user = connection.user = authResult.user;

      // The connection is no longer anonymous, remove it
      app.channel('anonymous').leave(connection);

      // Add it to the authenticated user channel
      app.channel('authenticated').join(connection);
      // Also join a user-specific channel for targeted notifications
      try { app.channel(`users/${user._id}`).join(connection); } catch (_) {}

      // Channels can be named anything and joined on any condition

      // E.g. to send real-time events only to admins use
      if(user.role === 'admin') {
        app.channel('admins').join(connection);
      }

      // If the user has the role of 'company', add them to the company channel
      if(user.role === 'company') {
        app.channel('companies').join(connection);
      }

      // If the user has the role of 'student', add them to the student channel
      if(user.role === 'student') {
        app.channel('students').join(connection);
      }
    }
  });

  app.on('disconnect', connection => {
    // Do something here when a connection is disconnected
  });

  // eslint-disable-next-line no-unused-vars
  app.publish((data, hook) => {
    // Here you can add event publishers to channels set up in `channels.js`
    // To publish only for a specific event use `app.publish(eventname, () => {})`

    console.log('Publishing all events to all authenticated users. See `channels.js` and https://docs.feathersjs.com/api/channels.html for more information.'); // eslint-disable-line

    // e.g. to publish all service events to all authenticated users use
    return app.channel('authenticated');
  });
};
