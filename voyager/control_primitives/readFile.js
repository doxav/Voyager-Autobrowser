function readFile(filename) {
    return fs.readFileSync(path.join(__dirname, "./workspace/" + filename), "utf8");
}
