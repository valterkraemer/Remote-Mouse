#### Demo sites ####

* [http://movieo.me/](movieo.me)

When we started out we wanted to explore Websockets and come up with a neat use for them. First we tought of using it as a presentation remote but found out that a couple of them already existed.

- first started with step wise navigation
- then started workin on mousemove
- then touchmove
- two finger scrolling
- gyroscrolling

- Debug bar to test different parameters
	* esim. latency
	* browser dev tools not sufficient
	* chrome artifical latency not working for websockets

- Thought of optimizing the communication using binary websocket frames, but not neccessary due to now already works on GPRS speeds. And the parsing overhead caused by the use of the text format protocol/frames is so minimal that based on that it was already clear that binary protocol wouldn't make much of a difference fro mthat point of view either.

