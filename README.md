# Voyager (Autobrowser)
An experimental fork of voyager aimed at implementing general purpose web browsing and Node JS code execution capabilities using the Voyager architecture. 
In this version, the mineflayer server is replaced with a NodeJS server running Puppeteer (Browser server), and the original Voyager code is tweaked to generate Puppeteer functions which are executed in realtime via the Browser server.

Wondering a possible integration with Auto-GPT which could leverage skills developed through Voyager like in https://arxiv.org/pdf/2305.16291.pdf see Table 2 and B.4.3 => should use Python instead of Node JS ? Selenium instead of Puppeteer except if Auto-GPT can support Puppeteer (https://github.com/Significant-Gravitas/Auto-GPT/pull/508).

[[Link to original repo]](https://github.com/MineDojo/Voyager/)
