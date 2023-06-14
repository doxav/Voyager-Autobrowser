function writeFile(filename, contents) {
    fs.writeFileSync(path.join(__dirname, "./workspace/" + filename), contents);
}
