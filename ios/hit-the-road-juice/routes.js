// Route data adapted from ios/dans-next-stop. All times are offline planning estimates.
(() => {
  'use strict';
  const places = [
    {"id": "home", "name": "Coles Toukley", "subtitle": "Yaralla St & Hargraves St, Toukley", "tags": ["home"], "query": "Coles Toukley, Yaralla St & Hargraves St, Toukley NSW 2263, Australia", "icon": "house"},
    {"id": "drummoyne", "name": "Drummoyne", "subtitle": "Inner West · Sydney Harbour", "tags": ["sydney", "suburb"], "query": "Drummoyne NSW 2047, Australia", "icon": "city"},
    {"id": "leichhardt", "name": "Leichhardt", "subtitle": "Inner West · Sydney", "tags": ["sydney", "suburb"], "query": "Leichhardt NSW 2040, Australia", "icon": "city"},
    {"id": "north-sydney", "name": "North Sydney", "subtitle": "Lower North Shore · Sydney", "tags": ["sydney", "suburb", "rail"], "query": "North Sydney NSW 2060, Australia", "icon": "city"},
    {"id": "pc", "name": "Point Clare", "subtitle": "Brisbane Water · Central Coast", "tags": ["rail", "water"], "query": "Point Clare NSW 2250, Australia", "icon": "wave"},
    {"id": "wwstation", "name": "Woy Woy Station", "subtitle": "CCN rail · bus interchange", "tags": ["rail"], "query": "Woy Woy Station NSW, Australia", "icon": "train", "aliases": "woy woy train railway station"},
    {"id": "gosford", "name": "Gosford Station", "subtitle": "CCN rail · bus interchange", "tags": ["rail"], "query": "Gosford Station NSW, Australia", "icon": "train", "aliases": "gosford railway train"},
    {"id": "umina", "name": "Umina Beach", "subtitle": "Beach stop · landing unconfirmed", "tags": ["beach"], "query": "Umina Beach NSW, Australia", "icon": "beach", "aliases": "umina beach"},
    {"id": "entrance", "name": "The Entrance baths", "subtitle": "Ocean side · landing unconfirmed", "tags": ["beach"], "query": "The Entrance Ocean Baths NSW, Australia", "icon": "wave", "aliases": "the entrance baths ocean ma"},
    {"id": "palm", "name": "Palm Beach", "subtitle": "Pittwater side · near the ferry wharf", "tags": ["beach", "water"], "query": "Palm Beach Ferry Wharf NSW, Australia", "icon": "beach", "aliases": "palm beach pittwater ferry wharf west"},
    {"id": "manly", "name": "Manly ferry wharf", "subtitle": "F1 / Fast Ferry · bus 199 interchange", "tags": ["water"], "query": "Manly Ferry Wharf NSW, Australia", "icon": "boat", "aliases": "manly ferry wharf harbour"},
    {"id": "ww", "name": "Woy Woy wharf", "subtitle": "Public wharf · station precinct", "tags": ["water"], "query": "Woy Woy Public Wharf NSW, Australia", "icon": "boat", "aliases": "woy woy public wharf"},
    {"id": "ettalong", "name": "Ettalong ferry", "subtitle": "Ferry Road · passenger ferry", "tags": ["water"], "query": "Ettalong Ferry Wharf NSW, Australia", "icon": "boat", "aliases": "ettalong ferry wharf palm beach"},
    {"id": "church", "name": "Church Point", "subtitle": "1858 Pittwater Road · commuter wharf", "tags": ["water"], "query": "Church Point Commuter Wharf NSW, Australia", "icon": "boat", "aliases": "church point commuter wharf pittwater"},
    {"id": "little", "name": "Little Manly", "subtitle": "Craig Avenue · harbour side", "tags": ["beach", "water"], "query": "Little Manly Beach Craig Avenue NSW, Australia", "icon": "beach", "aliases": "little manly beach ramp craig"},
    {"id": "myc", "name": "Manly Yacht Club", "subtitle": "Harbour side · landing permission unconfirmed", "tags": ["water"], "query": "Manly Yacht Club NSW, Australia", "icon": "boat", "aliases": "manly yacht club wharf"},
    {"id": "kirri", "name": "Kirribilli Wharf", "subtitle": "Holbrook Avenue · public alternative near Royal Sydney Yacht Squadron", "tags": ["water"], "query": "Kirribilli Wharf Holbrook Avenue NSW, Australia", "icon": "city", "aliases": "kirribilli currawilly royal sydney yacht squadron rsys holbrook wharf"},
    {"id": "mow", "name": "Man O’War Steps", "subtitle": "Beside the Sydney Opera House", "tags": ["water"], "query": "Man O War Steps Sydney NSW, Australia", "icon": "city", "aliases": "man o war manowar steps opera house sydney"},
    {"id": "bar", "name": "Barangaroo", "subtitle": "Sydney harbour · wharf area", "tags": ["water"], "query": "Barangaroo Wharf NSW, Australia", "icon": "city", "aliases": "barangaroo wharf harbour sydney"},
    {"id": "cq", "name": "Circular Quay", "subtitle": "Sydney · rail / ferry interchange", "tags": ["water", "rail"], "query": "Circular Quay Sydney NSW, Australia", "icon": "city", "aliases": "circular quay sydney ferry train"},
    {"id": "bay", "name": "Bayview Park ramp", "subtitle": "End of Burwood Road · Canada Bay, Concord", "tags": ["water"], "query": "Bayview Park Boat Ramp Burwood Road Concord NSW, Australia", "icon": "boat", "aliases": "bayview canada bay southside burwood erwood concord ramp"},
    {"id": "hornsby", "name": "Hornsby Station", "subtitle": "CCN rail interchange", "tags": ["rail"], "query": "Hornsby Station NSW, Australia", "icon": "train", "aliases": "hornsby train railway station"},
    {"id": "strathfield", "name": "Strathfield Station", "subtitle": "CCN route via Strathfield", "tags": ["rail"], "query": "Strathfield Station NSW, Australia", "icon": "train", "aliases": "strathfield train railway station"},
    {"id": "central", "name": "Central Station", "subtitle": "Sydney · CCN terminus", "tags": ["rail"], "query": "Central Station Sydney NSW, Australia", "icon": "train", "aliases": "central sydney railway train station"},
    {"id": "wyong", "name": "Wyong Station", "subtitle": "CCN rail interchange", "tags": ["rail"], "query": "Wyong Station NSW, Australia", "icon": "train", "aliases": "wyong railway train station"},
    {"id": "canton", "name": "Canton Beach", "subtitle": "Tuggerah Lake · Beach Parade ramp area", "tags": ["beach", "water"], "query": "Canton Beach Boat Ramp NSW, Australia", "icon": "wave", "aliases": "cannon cannon canton beach boat ramp"},
    {"id": "wyongah", "name": "Wyongah ramp", "subtitle": "Oakland Street · behind the fire station", "tags": ["water"], "query": "Wyongah Boat Ramp Oakland Street NSW, Australia", "icon": "boat", "aliases": "wyonga wyongah oakland ramp"},
    {"id": "picnic", "name": "Picnic Point", "subtitle": "The Entrance · lake-side boating endpoint", "tags": ["water"], "query": "Picnic Point The Entrance NSW, Australia", "icon": "wave", "aliases": "picnic point lake entrance"},
    {"id": "leich", "name": "Leichhardt restaurant wharf", "subtitle": "Exact wharf location pending", "tags": ["water"], "query": "", "icon": "boat", "aliases": "leichhardt restaurant wharf water main drag", "pending": true},
  ];

  const edges = [
    {"a": "wyong", "b": "gosford", "min": 24, "max": 30, "detail": "CCN stopping service. Check the chosen service’s stopping pattern.", "basis": "CCN timetable", "mode": "transit"},
    {"a": "gosford", "b": "pcstation", "min": 3, "max": 4, "detail": "CCN train; select a service that stops at Point Clare.", "basis": "CCN timetable", "mode": "transit"},
    {"a": "pcstation", "b": "wwstation", "min": 8, "max": 8, "detail": "CCN stopping train.", "basis": "CCN timetable", "mode": "transit"},
    {"a": "wwstation", "b": "hornsby", "min": 39, "max": 39, "detail": "Typical weekday stopping CCN train.", "basis": "CCN timetable", "mode": "transit"},
    {"a": "hornsby", "b": "strathfield", "min": 23, "max": 23, "detail": "CCN route via Epping and Strathfield.", "basis": "CCN timetable", "mode": "transit"},
    {"a": "strathfield", "b": "central", "min": 13, "max": 13, "detail": "CCN train. These rail legs can be one through service; a step is not necessarily a change.", "basis": "CCN timetable", "mode": "transit"},
    {"a": "wyongah", "b": "wyong", "min": 15, "max": 15, "detail": "Bus 81 using Kilpa Road / Murrawal Road. Ramp-to-stop walk and waiting are additional.", "basis": "Bus 81 timetable", "mode": "transit", "access": true},
    {"a": "canton", "b": "wyong", "min": null, "max": null, "detail": "Route 93 is limited weekday service. Use Trip Planner for the actual daytime connection.", "basis": "Departure dependent", "mode": "transit"},
    {"a": "gosford", "b": "entrancebus", "min": 50, "max": 60, "detail": "Bus 21 between Gosford and The Entrance.", "basis": "Bus 21 timetable", "mode": "transit"},
    {"a": "entrancebus", "b": "entrance", "min": null, "max": null, "detail": "Walk between the bus stop and ocean baths. This access walk has not been timed.", "basis": "Untimed walk", "mode": "transit"},
    {"a": "pc", "b": "pcstation", "min": null, "max": null, "detail": "Local access between the user-described ramp and station. Confirm the ramp pin before timing this walk.", "basis": "Untimed access", "mode": "transit"},
    {"a": "ww", "b": "wwstation", "min": null, "max": null, "detail": "Walk between the public wharf and station / bus precinct.", "basis": "Untimed walk", "mode": "transit"},
    {"a": "wwstation", "b": "umina", "min": 20, "max": 30, "detail": "Bus 55 via Umina Library / West Street, plus the walk to the beach. Waiting is extra.", "basis": "Bus 55 + walk estimate", "mode": "transit"},
    {"a": "wwstation", "b": "ettalong", "min": 20, "max": 30, "detail": "Bus 53 plus walk to the Ferry Road wharf. For Palm Beach, arrive 10 minutes before sailing.", "basis": "Bus 53 + walk estimate", "mode": "transit"},
    {"a": "ettalong", "b": "palm", "min": 25, "max": 30, "detail": "Passenger ferry between Ettalong and Palm Beach, Pittwater side. Separate ticket; no car ferry.", "basis": "Palm Beach Ferries", "mode": "transit"},
    {"a": "palm", "b": "church", "min": 45, "max": 60, "detail": "Bus 199 between Palm Beach and Mona Vale; bus 156 between Mona Vale and Church Point. Change at Mona Vale.", "basis": "Bus 199 / 156 + modest transfer allowance", "mode": "transit"},
    {"a": "church", "b": "manly", "min": 60, "max": 80, "detail": "Bus 156 between Church Point and Mona Vale; bus 199 between Mona Vale and Manly. Change at Mona Vale.", "basis": "Bus 156 / 199 + modest transfer allowance", "mode": "transit"},
    {"a": "manly", "b": "little", "min": 10, "max": 20, "detail": "Walk between Manly ferry wharf and Little Manly.", "basis": "Local walking allowance", "mode": "transit"},
    {"a": "manly", "b": "myc", "min": 10, "max": 20, "detail": "Walk between Manly ferry wharf and the yacht club.", "basis": "Local walking allowance", "mode": "transit"},
    {"a": "manly", "b": "cq", "min": 20, "max": 30, "detail": "Manly Fast Ferry is about 20 minutes; F1 timing varies by vessel. Waiting is extra.", "basis": "Manly ferry timing", "mode": "transit"},
    {"a": "cq", "b": "mow", "min": null, "max": null, "detail": "Walk between Circular Quay and the steps beside the Opera House. This final walk has not been timed.", "basis": "Untimed walk", "mode": "transit"},
    {"a": "cq", "b": "bar", "min": null, "max": null, "detail": "A further city connection or walk is needed. Check Trip Planner; this leg is not timed in the map.", "basis": "Connection not timed", "mode": "transit"},
    {"a": "central", "b": "cq", "min": null, "max": null, "detail": "Use a city rail / bus connection or walk. Check Trip Planner; this connection was not timed in the original map.", "basis": "Connection not timed", "mode": "transit"},
    {"a": "canton", "b": "wyongah", "min": 15, "max": 25, "detail": "Via the Toukley / Gorokan road network. Check exact ramp access in live directions.", "basis": "Local estimate", "mode": "drive"},
    {"a": "wyongah", "b": "entrance", "min": 20, "max": 30, "detail": "Via the Wyong / lake road network. Final baths access is extra.", "basis": "Local estimate", "mode": "drive"},
    {"a": "entrance", "b": "pc", "min": 30, "max": 40, "detail": "Central Coast Highway via Bateau Bay and Gosford, then Point Clare.", "basis": "Published town baseline ~35 min", "mode": "drive"},
    {"a": "pc", "b": "ww", "min": 10, "max": 15, "detail": "Brisbane Water Drive and local roads.", "basis": "Local estimate", "mode": "drive"},
    {"a": "ww", "b": "umina", "min": 10, "max": 15, "detail": "Peninsula local roads between Woy Woy and Umina.", "basis": "Local estimate", "mode": "drive"},
    {"a": "umina", "b": "palm", "min": 80, "max": 100, "detail": "Drive around via the M1 and Mona Vale Road. The Ettalong passenger ferry does not carry cars.", "basis": "Published baseline ~83 min + planning range", "mode": "drive"},
    {"a": "palm", "b": "church", "min": 20, "max": 30, "detail": "Barrenjoey Road, Mona Vale and Pittwater Road.", "basis": "Local estimate", "mode": "drive"},
    {"a": "church", "b": "little", "min": 30, "max": 40, "detail": "Pittwater Road and Manly local roads; finish near Craig Avenue.", "basis": "Published Manly baseline + destination allowance", "mode": "drive"},
    {"a": "church", "b": "myc", "min": 30, "max": 40, "detail": "Pittwater Road and Manly local roads to the harbour side.", "basis": "Published Manly baseline + destination allowance", "mode": "drive"},
    {"a": "myc", "b": "kirri", "min": 20, "max": 30, "detail": "Manly to Kirribilli via the road network; finish near Holbrook Avenue.", "basis": "Published town baseline ~16 min + wharf-access allowance", "mode": "drive"},
    {"a": "little", "b": "kirri", "min": 20, "max": 30, "detail": "Manly to Kirribilli via the road network; finish near Holbrook Avenue.", "basis": "Published town baseline + wharf-access allowance", "mode": "drive"},
    {"a": "kirri", "b": "mow", "min": 15, "max": 25, "detail": "Cross to the city and approach the Opera House precinct. Parking and final walk are extra.", "basis": "Local estimate", "mode": "drive"},
    {"a": "mow", "b": "bar", "min": 10, "max": 20, "detail": "City streets between the Opera House precinct and Barangaroo. Parking and final walk are extra.", "basis": "Local estimate", "mode": "drive"},
    {"a": "bar", "b": "bay", "min": 20, "max": 30, "detail": "Drive to the end of Burwood Road, Concord, for Bayview Park ramp.", "basis": "Local estimate", "mode": "drive"},
    {"a": "pc", "b": "central", "min": 60, "max": 75, "detail": "Kariong and the M1, then a current city route. Tolls may apply; parking is extra.", "basis": "Published Sydney baseline ~59 min + city allowance", "mode": "drive"},
    {"a": "pcstation", "b": "pc", "min": null, "max": null, "detail": "Same Point Clare area, but the station-to-ramp adjustment is not timed. Exact ramp pin remains unconfirmed.", "basis": "Local access not timed", "mode": "drive"},
    {"a": "wwstation", "b": "ww", "min": null, "max": null, "detail": "The station and wharf are in the same precinct. The road-access adjustment is not timed.", "basis": "Local access not timed", "mode": "drive"},
    {"a": "canton", "b": "wyongah", "min": 30, "max": 30, "detail": "Tuggerah Lake crossing with slow ramp approaches.", "basis": "8-knot lake model", "mode": "boat"},
    {"a": "wyongah", "b": "picnic", "min": 45, "max": 45, "detail": "Stay within the lake network. This ends at Picnic Point, not the ocean baths.", "basis": "Lake passage model", "mode": "boat"},
    {"a": "entrance", "b": "pc", "min": 100, "max": 100, "detail": "Open-ocean start, then coastal passage to Broken Bay and Brisbane Water. Landing at the baths is unconfirmed.", "basis": "~15 nm at 20 kn + ~6.4 nm at 8 kn + ~0.5 nm at 4 kn", "mode": "boat"},
    {"a": "pc", "b": "ww", "min": 30, "max": 30, "detail": "Brisbane Water inland passage. The exact route from the user-described ramp remains approximate.", "basis": "Inland passage model", "mode": "boat"},
    {"a": "ww", "b": "umina", "min": 45, "max": 45, "detail": "Via navigable channels and Broken Bay. Umina is a beach stop; landing is unconfirmed.", "basis": "Private-boat model", "mode": "boat"},
    {"a": "umina", "b": "palm", "min": 25, "max": 25, "detail": "Across Broken Bay to the Pittwater side of Palm Beach.", "basis": "Private-boat model", "mode": "boat"},
    {"a": "palm", "b": "church", "min": 30, "max": 30, "detail": "Along Pittwater; allow slower passage among moorings and on wharf approaches.", "basis": "Private-boat model", "mode": "boat"},
    {"a": "church", "b": "little", "min": 90, "max": 90, "detail": "North out of Pittwater, around Barrenjoey, offshore, then around North Head into Sydney Harbour.", "basis": "Coastal passage model", "mode": "boat"},
    {"a": "little", "b": "myc", "min": 10, "max": 10, "detail": "Short harbour leg. Yacht club landing permission and availability are unconfirmed.", "basis": "Harbour passage model", "mode": "boat"},
    {"a": "myc", "b": "kirri", "min": 30, "max": 30, "detail": "Across the harbour to Holbrook Avenue Wharf, the public alternative near Royal Sydney Yacht Squadron. Check landing rules.", "basis": "Harbour passage model", "mode": "boat"},
    {"a": "kirri", "b": "mow", "min": 10, "max": 10, "detail": "Short harbour leg to the Opera House steps. Approach speed and landing availability affect timing.", "basis": "Harbour passage model", "mode": "boat"},
    {"a": "mow", "b": "bar", "min": 15, "max": 15, "detail": "Harbour passage between the Opera House precinct and Barangaroo. Confirm landing access.", "basis": "Harbour passage model", "mode": "boat"},
    {"a": "bar", "b": "bay", "min": 35, "max": 35, "detail": "West through the harbour / Parramatta River to Canada Bay and the Burwood Road ramp, Concord.", "basis": "Harbour / river passage model", "mode": "boat"},
    {"a": "home", "b": "wyong", "mode": "transit", "min": null, "max": null, "detail": "Check route 93 between Toukley and Wyong Station. Allow for the walk from Coles and the service schedule.", "basis": "Transport for NSW · route 93"},
  ];

  const pointClareDrives = {
    "wwstation": {"min": 10, "max": 15, "out": "Brisbane Water Drive south to Woy Woy Station.", "back": "Brisbane Water Drive north to Point Clare.", "basis": "Local planning estimate; parking extra."},
    "ww": {"min": 10, "max": 15, "out": "Brisbane Water Drive to the Woy Woy wharf precinct.", "back": "Brisbane Water Drive north to Point Clare.", "basis": "Local planning estimate; parking extra."},
    "gosford": {"min": 5, "max": 15, "out": "Head north via West Gosford to the station precinct.", "back": "Return via West Gosford and Brisbane Water Drive.", "basis": "Published Point Clare / Gosford taxi baseline ~5 min; station and traffic allowance added."},
    "umina": {"min": 20, "max": 25, "out": "Brisbane Water Drive through Woy Woy, then local roads to Umina Beach.", "back": "Local roads through Woy Woy, then Brisbane Water Drive to Point Clare.", "basis": "Local planning estimate carried from the original map."},
    "entrance": {"min": 30, "max": 40, "out": "Central Coast Highway via Gosford and Bateau Bay, then the baths precinct.", "back": "Central Coast Highway via Bateau Bay and Gosford, then Point Clare.", "basis": "Published town-to-town baseline ~35 min; final baths access extra."},
    "palm": {"min": 75, "max": 95, "out": "Kariong / M1, Mona Vale Road and the Northern Beaches road network to the Pittwater side of Palm Beach.", "back": "Return via Mona Vale Road and the M1, then Kariong to Point Clare.", "basis": "Nearby-area proxy: Gosford / Palm Beach published baseline ~74 min, widened for Point Clare and local access."},
    "church": {"min": 65, "max": 85, "out": "Kariong / M1 and Mona Vale Road, then the Church Point commuter-wharf precinct.", "back": "Return from Church Point via Mona Vale Road, M1 and Kariong.", "basis": "Nearby-area proxy: Gosford / Church Point published baseline ~63 min, widened for Point Clare and wharf access."},
    "manly": {"min": 65, "max": 85, "out": "Kariong / M1, then the Northern Beaches road network to the Manly harbour-side destination.", "back": "Return through the Northern Beaches road network to the M1, then Kariong / Point Clare.", "basis": "Published Manly / Point Clare baseline ~65 min; destination and traffic allowance added."},
    "little": {"min": 65, "max": 85, "out": "Kariong / M1, then the Northern Beaches road network to the Manly harbour-side destination.", "back": "Return through the Northern Beaches road network to the M1, then Kariong / Point Clare.", "basis": "Published Manly / Point Clare baseline ~65 min; destination and traffic allowance added."},
    "myc": {"min": 65, "max": 85, "out": "Kariong / M1, then the Northern Beaches road network to the Manly harbour-side destination.", "back": "Return through the Northern Beaches road network to the M1, then Kariong / Point Clare.", "basis": "Published Manly / Point Clare baseline ~65 min; destination and traffic allowance added."},
    "ettalong": {"min": 20, "max": 30, "out": "Brisbane Water Drive through Woy Woy, then Ettalong and Ferry Road.", "back": "Return from Ferry Road through Woy Woy and along Brisbane Water Drive.", "basis": "Local planning estimate; ferry-wharf parking extra."},
    "hornsby": {"min": 40, "max": 50, "out": "Kariong / M1 south to Hornsby, then the station precinct.", "back": "M1 north to Kariong, then Point Clare.", "basis": "Published Point Clare / Hornsby baseline ~40 min; local allowance added."},
    "strathfield": {"min": 60, "max": 75, "out": "M1 and the Sydney road network to Strathfield Station; check the current toll route.", "back": "Follow a current route to the M1 north, then Kariong / Point Clare.", "basis": "Published Point Clare / Strathfield baseline ~59 min; station allowance added."},
    "central": {"min": 60, "max": 75, "out": "Kariong to the M1, then a current city route to Central. Tolls may apply.", "back": "Leave the city on a current route to the M1, then Kariong / Point Clare.", "basis": "Published Point Clare / Sydney baseline ~59 min, with a city destination allowance."},
    "wyong": {"min": 25, "max": 35, "out": "Use the road network north toward Wyong and the station precinct.", "back": "Return south to Point Clare using the current road route.", "basis": "Published Point Clare / Wyong baseline ~24 min; station and traffic allowance added."},
    "canton": {"min": 40, "max": 55, "out": "Head toward Wyong / Toukley and the Canton Beach foreshore.", "back": "Return from Canton Beach via the Wyong / Toukley road network to Point Clare.", "basis": "Local planning estimate informed by Point Clare / Wyong ~24 min and Wyong / Canton Beach ~17 min."},
    "wyongah": {"min": 35, "max": 45, "out": "Head north toward Wyong, then Wyongah and Oakland Street.", "back": "Return via Wyong and the road network south to Point Clare.", "basis": "Local planning estimate; exact ramp access needs live directions."},
    "picnic": {"min": 30, "max": 40, "out": "Central Coast Highway toward The Entrance, then the lake-side Picnic Point area.", "back": "Return via Central Coast Highway and Gosford to Point Clare.", "basis": "Local planning estimate based on the nearby The Entrance baseline."},
    "kirri": {"min": 60, "max": 75, "out": "Kariong / M1 and the Sydney road network to the selected waterfront precinct. Check the current route and parking.", "back": "Use a current route to the M1 north, then Kariong and Point Clare.", "basis": "Local planning estimate using the Point Clare / Sydney town baseline as context; exact waterfront endpoint not separately verified."},
    "mow": {"min": 65, "max": 80, "out": "Kariong / M1 and the Sydney road network to the selected waterfront precinct. Check the current route and parking.", "back": "Use a current route to the M1 north, then Kariong and Point Clare.", "basis": "Local planning estimate using the Point Clare / Sydney town baseline as context; exact waterfront endpoint not separately verified."},
    "bar": {"min": 60, "max": 80, "out": "Kariong / M1 and the Sydney road network to the selected waterfront precinct. Check the current route and parking.", "back": "Use a current route to the M1 north, then Kariong and Point Clare.", "basis": "Local planning estimate using the Point Clare / Sydney town baseline as context; exact waterfront endpoint not separately verified."},
    "cq": {"min": 65, "max": 80, "out": "Kariong / M1 and the Sydney road network to the selected waterfront precinct. Check the current route and parking.", "back": "Use a current route to the M1 north, then Kariong and Point Clare.", "basis": "Local planning estimate using the Point Clare / Sydney town baseline as context; exact waterfront endpoint not separately verified."},
    "bay": {"min": 65, "max": 80, "out": "Kariong / M1 and the Sydney road network to the selected waterfront precinct. Check the current route and parking.", "back": "Use a current route to the M1 north, then Kariong and Point Clare.", "basis": "Local planning estimate using the Point Clare / Sydney town baseline as context; exact waterfront endpoint not separately verified."},
  };

  const sources = [
    ["Coles Toukley · street address", "https://www.coles.com.au/find-stores/coles/nsw/toukley-781"],
    ["Route 93 · Toukley and Wyong", "https://transportnsw.info/routes/details/busways-omr6/93/26093"],
    ["CCN rail timetable", "https://transportnsw.info/documents/timetables/93-CCN-Central-Coast-Newcastle-Line-20251019.pdf"],
    ["Bus 21 · The Entrance", "https://transportnsw.info/documents/timetables/27-21-The-Entrance-North-to-Gosford-via-Bateau-Bay-East-20261012.pdf"],
    ["Bus 53 · Ettalong", "https://transportnsw.info/documents/timetables/26-53-Woy-Woy-to-Booker-Bay-Loop-Service-20261012.pdf"],
    ["Bus 55 · Umina", "https://transportnsw.info/documents/timetables/26-55-Ettalong-Beach-to-Gosford-via-Woy-Woy-and-Umina-Beach-20261012.pdf"],
    ["Bus 199 · Northern Beaches", "https://transportnsw.info/documents/timetables/29-199-Palm-Beach-to-Manly-via-Mona-Vale-Dee-Why-20261012.pdf"],
    ["Bus 156 · Church Point", "https://transportnsw.info/documents/timetables/29-156-McCarrs-Creek-to-Mona-Vale-20261012.pdf"],
    ["Buses 81 / 93 · northern lake", "https://transportnsw.info/routes/bus"],
    ["Palm Beach Ferries", "https://palmbeachferries.com.au/timetables/"],
    ["NSW boating maps", "https://www.nsw.gov.au/driving-boating-and-transport/boating-and-marine/using-waterways-boating-and-transport-information/navigation-communication-maps-times-and-restrictions/boating-maps"],
    ["Central Coast boat ramps", "https://www.centralcoast.nsw.gov.au/recreation/leisure/boating"],
    ["The Entrance navigation assessment", "https://www.centralcoast.nsw.gov.au/sites/default/files/2023-05/Dredging%20the%20Entrance%20Channel%20-%20Royal%20Haskoning%202020.pdf"],
    ["Church Point wharf", "https://www.northernbeaches.nsw.gov.au/things-to-do/recreation-area/church-point-wharf"],
    ["Canada Bay parks / ramps", "https://www.canadabay.nsw.gov.au/lifestyle/parklands-and-waterways/parks"],
    ["Road baseline · Umina / Palm Beach", "https://www.rome2rio.com/s/Umina-Beach/Palm-Beach-NSW-Australia"],
    ["Road baseline · Church Point / Manly", "https://www.rome2rio.com/s/Church-Point-NSW-Australia/Manly"],
    ["Road baseline · Entrance / Point Clare", "https://www.distancesfrom.com/directions-from-Point-Clare-NSW-2250-to-The-Entrance-NSW-2261-Australia/DirectionHistory/34735773.aspx"],
    ["Road baseline · Point Clare / Sydney", "https://www.rome2rio.com/s/Point-Clare/Sydney"],
    ["Road baseline · Manly / Kirribilli", "https://www.rome2rio.com/s/Manly/Kirribilli"],
    ["Kirribilli Wharf location", "https://transportnsw.info/stop?q=206132"],
    ["Manly ferry travel-time data", "https://opendata.transport.nsw.gov.au/sites/default/files/2025-04/MFF%20Release%20Notes%20V2.1.pdf"],
    ["Transport for NSW Trip Planner", "https://transportnsw.info/trip"],
    ["Road baseline · Point Clare / Gosford", "https://www.rome2rio.com/s/Point-Clare/Gosford"],
    ["Road baseline · Point Clare / Wyong", "https://www.rome2rio.com/s/Point-Clare/Wyong"],
    ["Road baseline · Wyong / Canton Beach", "https://www.rome2rio.com/s/Wyong/Canton-Beach"],
    ["Road baseline · Point Clare / Hornsby", "https://www.rome2rio.com/s/Point-Clare/Hornsby"],
    ["Road baseline · Point Clare / Strathfield", "https://www.rome2rio.com/s/Point-Clare/Strathfield"],
    ["Road baseline · Manly / Point Clare", "https://www.rome2rio.com/s/Manly/Point-Clare"],
    ["Nearby-area road proxy · Gosford / Palm Beach", "https://www.rome2rio.com/s/Gosford/Palm-Beach-NSW-Australia"],
    ["Nearby-area road proxy · Gosford / Church Point", "https://www.rome2rio.com/s/Gosford/Church-Point-NSW-Australia"],
  ];

  const byId = new Map(places.map(place => [place.id, place]));
  const home = byId.get('home');
  const junctionNames = {
    entrancebus: 'The Entrance bus interchange',
    pcstation: 'Point Clare Station'
  };
  const boatingMaps = sources.find(([name]) => name === 'NSW boating maps')[1];

  // Published town-to-town driving minutes. These are approximate in both directions.
  const toukleyDrives = {
    wyong: [14, 'Wyong-Station', 'Wyong Station'],
    entrance: [14, 'The-Entrance', 'The Entrance town centre'],
    picnic: [14, 'The-Entrance', 'The Entrance town centre'],
    gosford: [36, 'Gosford', 'Gosford'],
    ww: [47, 'Woy-Woy', 'Woy Woy'],
    wwstation: [47, 'Woy-Woy', 'Woy Woy'],
    umina: [51, 'Umina-Beach', 'Umina Beach'],
    hornsby: [63, 'Hornsby-Station', 'Hornsby Station'],
    central: [86, 'Central-Station', 'Central Station']
  };
  const hornsbyDrives = {
    drummoyne: [23, 'Hornsby-Station/Drummoyne'],
    leichhardt: [28, 'Hornsby/Leichhardt'],
    'north-sydney': [24, 'Hornsby-Station/North-Sydney']
  };
  for (const [minutes, slug, town] of Object.values(toukleyDrives)) {
    const url = 'https://www.rome2rio.com/s/Toukley/' + slug;
    if (!sources.some(([, existing]) => existing === url)) sources.push(['Toukley to ' + town + ' · ' + minutes + ' min', url]);
  }
  for (const [id, [, slug]] of Object.entries(hornsbyDrives)) {
    sources.push(['Hornsby to ' + byId.get(id).name + ' · driving baseline', 'https://www.rome2rio.com/s/' + slug]);
  }

  const bus93 = edges.find(edge => edge.a === 'home' && edge.b === 'wyong');
  Object.assign(bus93, {
    min: 22, max: 29, backMin: 23, backMax: 24, access: true,
    detail: 'Limited weekday morning route 93 service from Toukley Shopping Plaza. Add the walk from Coles and waiting.',
    backDetail: 'Limited weekday evening route 93 service to Main Rd at Summerside St. Add waiting and the walk to Coles.',
    basis: 'Transport for NSW · route 93 timetable, effective 22 Nov 2026'
  });
  sources.push(['Bus 93 · directional running times', 'https://transportnsw.info/documents/timetables/26-93-Noraville-to-Tuggerah-via-Wyong-Toukley-20261122.pdf']);
  const cityConnections = [
    ['central', 'drummoyne', '501 bus between Central and Victoria Road, Drummoyne.', 'https://transportnsw.info/stop?q=10112957'],
    ['central', 'leichhardt', '440 bus between Railway Square and Norton Street, Leichhardt.', 'https://transportnsw.info/routes/details/transit-systems/440/74440'],
    ['hornsby', 'north-sydney', 'T1 North Shore Line between Hornsby and North Sydney via Gordon.', 'https://transportnsw.info/routes/details/sydney-trains/t1/020t1']
  ];
  for (const [a, b, detail, source] of cityConnections) {
    edges.push({mode: 'transit', a, b, min: null, max: null, detail, backDetail: detail, basis: 'Transport for NSW · check the next service'});
    sources.push([byId.get(b).name + ' · public transport connection', source]);
  }

  function minutesLabel(minutes) {
    if (minutes < 60) return minutes + ' min';
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? hours + 'h ' + rest + 'm' : hours + 'h';
  }

  function rangeLabel(min, max) {
    if (min === max) return minutesLabel(min);
    if (max <= 60) return min + '–' + max + ' min';
    return minutesLabel(min) + '–' + minutesLabel(max);
  }

  function endpointName(id, mode) {
    if (id === 'pc' && mode === 'boat') return 'Point Clare ramp';
    return byId.get(id)?.name || junctionNames[id];
  }

  function routeUrl(from, to, mode) {
    if (mode === 'boat') return boatingMaps;
    const endpoint = place => place.id === 'pc' && mode === 'transit' ? 'Point Clare Station NSW, Australia' : place.query;
    const params = new URLSearchParams({
      api: '1', origin: endpoint(from), destination: endpoint(to),
      travelmode: mode === 'drive' ? 'driving' : 'transit'
    });
    return 'https://www.google.com/maps/dir/?' + params;
  }

  function directDrive(from, to) {
    const other = anchor => from.id === anchor ? to.id : to.id === anchor ? from.id : null;
    const pc = pointClareDrives[other('pc')];
    if (pc) return {min: pc.min, max: pc.max, label: rangeLabel(pc.min, pc.max),
      detail: 'Point Clare driving estimate. Allow for traffic, parking and final access.',
      steps: [from.id === 'pc' ? pc.out : pc.back, pc.basis]};

    const otherHome = other('home');
    const nearby = toukleyDrives[otherHome];
    if (nearby) {
      const [minutes, , town] = nearby;
      return {min: minutes, max: minutes, label: '≈ ' + minutesLabel(minutes),
        detail: 'Toukley to ' + town + ' area baseline. Exact endpoints, traffic and parking can change the time.',
        steps: ['Published Toukley–' + town + ' drive: ' + minutesLabel(minutes) + ' (Rome2Rio).']};
    }
    if (otherHome === 'pc') {
      const first = toukleyDrives.gosford[0], last = pointClareDrives.gosford;
      const min = first + last.min, max = first + last.max;
      const steps = ['Toukley ↔ Gosford: ' + minutesLabel(first) + '.', 'Gosford ↔ Point Clare: ' + rangeLabel(last.min, last.max) + '.'];
      return {min, max, label: rangeLabel(min, max), detail: 'Two saved driving estimates via Gosford. Allow for local access and traffic.', steps: from.id === 'home' ? steps : steps.reverse()};
    }
    const viaHornsby = hornsbyDrives[otherHome];
    const localLeg = hornsbyDrives[other('hornsby')];
    if (!viaHornsby && !localLeg) return null;
    const suburb = byId.get(viaHornsby ? otherHome : other('hornsby'));
    const cityMinutes = (viaHornsby || localLeg)[0];
    const minutes = cityMinutes + (viaHornsby ? toukleyDrives.hornsby[0] : 0);
    const steps = ['Hornsby ↔ ' + suburb.name + ': ' + minutesLabel(cityMinutes) + '.'];
    if (viaHornsby) {
      steps.unshift('Toukley ↔ Hornsby: ' + minutesLabel(toukleyDrives.hornsby[0]) + '.');
      if (to.id === 'home') steps.reverse();
    }
    return {min: minutes, max: minutes, label: '≈ ' + minutesLabel(minutes),
      detail: viaHornsby ? 'Two driving legs via Hornsby. Live directions can choose a different route.' : 'Suburb-level driving estimate. Traffic and parking are extra.',
      steps};
  }

  // Use the original planner’s bidirectional graph only for mapped connections.
  function mappedLegs(from, to, mode) {
    const anchor = id => (mode === 'transit' && id === 'pc') ? 'pcstation' : id;
    const start = anchor(from.id), end = anchor(to.id);
    const frontier = new Set([start]), costs = new Map([[start, 0]]), previous = new Map();
    const candidates = edges.filter(edge => edge.mode === mode);
    while (frontier.size) {
      const node = [...frontier].reduce((best, id) => costs.get(id) < costs.get(best) ? id : best);
      frontier.delete(node);
      if (node === end) break;
      for (const edge of candidates) {
        const next = edge.a === node ? edge.b : edge.b === node ? edge.a : null;
        if (!next) continue;
        const reverse = node === edge.b;
        const min = reverse && edge.backMin != null ? edge.backMin : edge.min;
        const max = reverse && edge.backMax != null ? edge.backMax : edge.max;
        const cost = costs.get(node) + (min === null ? 35 : (min + max) / 2) + (edge.access ? 15 : 0);
        if (cost >= (costs.get(next) ?? Infinity)) continue;
        costs.set(next, cost);
        previous.set(next, {from: node, to: next, edge, min, max, reverse});
        frontier.add(next);
      }
    }
    if (!previous.has(end)) return [];
    const legs = [];
    for (let id = end; id !== start; id = previous.get(id).from) legs.unshift(previous.get(id));
    return legs;
  }

  function get(from, to, mode) {
    const result = {label: '', detail: '', steps: [], url: null, linkLabel: '', min: null, max: null};
    if (!from || !to || from.pending || to.pending) {
      return {...result, label: 'Pin pending', detail: 'The restaurant wharf still needs a confirmed name and location.'};
    }
    if (from.id === to.id && (from.id !== 'custom' || from.query === to.query)) {
      return {...result, label: 'Same place', detail: 'Choose a different starting point or destination.', min: 0, max: 0};
    }
    result.url = routeUrl(from, to, mode);
    result.linkLabel = {drive: 'Open driving directions', transit: 'Check departures', boat: 'Open NSW boating maps'}[mode];
    const direct = mode === 'drive' && directDrive(from, to);
    if (direct) return {...result, ...direct};
    const legs = mappedLegs(from, to, mode);
    if (!legs.length) {
      if (mode === 'boat') return {...result, label: 'No mapped passage', detail: 'Choose two mapped waterfront stops to see a private-boat estimate.'};
      return {...result, label: mode === 'drive' ? 'Check live ETA' : 'Check departures',
        detail: 'Open live directions for timing between these two locations.'};
    }
    const partial = legs.some(leg => leg.min === null || leg.edge.access);
    const min = legs.reduce((sum, leg) => sum + (leg.min ?? 0), 0);
    const max = legs.reduce((sum, leg) => sum + (leg.max ?? 0), 0);
    result.label = partial ? 'Check full trip' : (mode === 'boat' ? '≈ ' : '') + rangeLabel(min, max);
    if (!partial) { result.min = min; result.max = max; }
    if (partial) {
      result.detail = (max > 0 ? 'Timed legs total ' + rangeLabel(min, max) + '. ' : '') + 'Add untimed access, connections and waiting.';
    } else {
      result.detail = {
        drive: 'Saved route via the listed stops. Traffic, parking and final access are extra.',
        transit: 'Scheduled or estimated travel legs. Allow for waiting, walking and connections.',
        boat: 'Passage model via the listed stops. Confirm weather, access and landing conditions before departure.'
      }[mode];
    }
    result.steps = legs.map(({from, to, edge, min, max, reverse}) => {
      const timing = min === null ? 'Untimed' : rangeLabel(min, max);
      const note = reverse ? edge.backDetail || edge.basis : edge.detail;
      return endpointName(from, mode) + ' → ' + endpointName(to, mode) + ' · ' + timing + '. ' + note;
    });
    return result;
  }

  globalThis.Routes = {places, home, get, sources};
})();
