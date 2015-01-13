env setup:
1. download selenium server 2.44.0
2. start hub: java -jar selenium-server-standalone-2.44.0.jar -role hu -role hub
3. start and register a node: java -jar selenium-server-standalone-2.44.0.jar -role node  -hub http://localhost:4444/grid/register
4. now the hub is ready to access from whichever test cases: http://localhost:4444/wd/hub