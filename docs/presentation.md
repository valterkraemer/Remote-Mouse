#### Demo sites ####

* [http://movieo.me/](movieo.me)

-------------- VALTER --------------
When we started out we wanted to explore Websockets and come up with a neat use for them. First we tought of using it as a presentation remote but found out that a couple of them already existed.

- pointer is just an image

- Reload: roomcode stored in sessionstorage.

- Closure compiler, whole script in bookmark.

- first started with step wise navigation
- then started workin on mousemove
- then touchmove

- Screen size always 100% on client and remote

- two finger scrolling
- gyroscrolling
	* 60Hz on iOS Safari

-------------- VILLE --------------

- To find out how our implementation works and what are the things
  affecting it we implemented a debug bar in the remote.

  

- Debug bar to test different parameters
	* esim. latency
	* browser dev tools not sufficient
	* chrome netwrork throttling not working for websockets

- Thought of optimizing the communication using binary websocket
  frames, but not neccessary due to now already works on GPRS
  speeds. And the parsing overhead caused by the use of the text
  format protocol/frames is so minimal that based on that it was
  already clear that binary protocol wouldn't make much of a
  difference fro mthat point of view either.

- normal/extreme use

- CPU load on an Intel Core i7-3610QM 2.30GHz (Quad core), Google
Chrome both controller and client, with local server: ~9%, quite
evenly distributed accross cores.

- Chrome's real time rendering of WebSocket frames is quite resource
intensive, affects load measuring results considerably.

- About 80-90 messages/sec submited with the above laptop when the
mouse is moving at normal speed, ~120 when fast. WS packet size about
40bytes with batch size 1. Causes network traffic (both ways included)
about ~50-60kB/s. Does not compute, 120*40=4800 --> overhead?

- Why not work on all sites. (Content script policy)

- Why not working on page transition (javascript injection).

-------------- VALTER --------------

- Tested with users, they found that if latency was over about 200ms it was quite lousy, over that they were quite happy.

- We tested over different bandwiths and found that event though it works over GPRS the latency was something like 500ms and not very usable. 3G, LTE, WIFI all gave something like 70ms when connection to Heroku's servers in Germany. When connecting over WI-FI to a local network maching, the latsency was only about 5ms.

- What have we learned:
	* Websockets are really efficient.
	* Pure javascript
	* Set up project.
	* Using sockets
	* Gyro
	* Little code, alot happends.

