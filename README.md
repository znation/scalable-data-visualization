# Scalable Data Visualization
React.js Conference 2015 talk and demo.

This is the demo code repository for the React.js Conf 2015 talk, [Scalable Data Visualization](http://conf.reactjs.com/schedule.html#scalable-data-visualization).

The React.js component source is [here](https://github.com/znation/scalable-data-visualization/tree/master/src/components).

Presentation slides are viewable [here](https://docs.google.com/presentation/d/1DDlR6Hd03G2HcIjHzEkUf9GhX-bbaDyIl0CTUNsO1rI/pub?start=false&loop=false&delayms=60000).

## Running the demo

1. Clone the repository.
2. Download [bootstrap.dat](https://bitcoin.org/bin/blockchain/) into the `bin/` directory. It's big, so this will take a while.
3. Run `npm install` in the repository root to bring in Node dependencies.
4. When the download is complete, run:

        cd bin/
        node server.js

5. Browse to [http://localhost:8080](http://localhost:8080).
