Note that all tools might rely on all other tools (including asciiworld itself) to be available in your `$PATH`.

Tracking satellites
===================

This, again, is very much influenced by [trehn's termtrack](https://github.com/trehn/termtrack).

![asciiworld-sat-track](/asciiworld-sat-track.png?raw=true)

asciiworld-sat-get
------------------

Get satellite data:

    asciiworld-sat-get 25544

Here's an index: [Master TLE Index](http://www.celestrak.com/NORAD/elements/master.asp).

The script simply prints the data on STDOUT.

Dependencies:

*  curl

asciiworld-sat-calc
-------------------

This scripts reads TLE data from STDIN.

    asciiworld-sat-get 25544 | asciiworld-sat-calc

It creates a point and three tracks for asciiworld: The current position of the satellite itself, the next full orbit, 5% of the previous orbit and a track which marks the satellite's footprint (i.e., "visibility radius").

You can also specify `-F` to omit the footprint track or `-O` to omit
the orbit.

Dependencies:

*  Python 2 or 3
*  [pyephem](http://rhodesmill.org/pyephem/)

Combining the tools with asciiworld: asciiworld-sat-track
---------------------------------------------------------

`-o` specifies the location of you, the observer, followed by all satellites you want to track:

    asciiworld-sat-track -o '50 8' 25544 25078

Note that `-o` is optional. If it's not given, the script will try to auto-detect your public IP using asciiworld-ip-geo.

You can also specify `-d 5` to quit after 5 seconds.

You can also specify `-F` to omit the footprint track or `-O` to omit
the orbit.

You can pass raw arguments to asciiworld using `-r`, e.g. `-r '-p ham -Sb'`.

Dependencies:

*  tput from ncurses

TCP/IP connections
==================

![asciiworld-tcp-monitor](/asciiworld-tcp-monitor.png?raw=true)

asciiworld-ip-geo
-----------------

Performs a GeoIP database lookup:

    asciiworld-ip-geo 91.198.174.192

It prints latitude and longitude on STDOUT. If you omit the argument, the script tries to auto-detect your public IP by querying `ifconfig.co`.

Dependencies:

*  [python-maxminddb](https://pypi.org/project/maxminddb/)
*  A GeoIP2 city database, for example the mmdb database from [db-ip.com](https://db-ip.com/db/download/ip-to-city-lite)

The script needs to know about the location of said database. Either patch the script itself or set the environment variable `$ASCIIWORLD_IPDB` to the appropriate path.

Combining the tools with asciiworld: asciiworld-tcp-monitor
-----------------------------------------------------------

`-o` specifies the location of you, the observer:

    asciiworld-tcp-monitor -o '50 8'

Note that `-o` is optional. If it's not given, the script will try to auto-detect your public IP using asciiworld-ip-geo.

You can also specify `-d 5` to quit after 5 seconds.

You can pass raw arguments to asciiworld using `-r`, e.g. `-r '-p ham -Sb'`.

Dependencies:

*  GNU awk
*  ss from iproute2
*  tput from ncurses

Shortest paths
==============

asciiworld-waypoints
--------------------

Given a series of locations, this script can calculate tracks between them. For example, this takes you from Mainz over New York City, Hawaii, Tokyo, Bangkok, and Perth to Cape Town:

    asciiworld-waypoints '50 8' '40 -74' '21 -157' '35 139' '13 100' '-31 115' '-33 18'

The script prints the resulting tracks on STDOUT.

Dependencies:

*  [GeographicLib (Python)](http://geographiclib.sourceforge.net/html/other.html#python)
