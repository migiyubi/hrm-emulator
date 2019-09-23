export class ProblemBase {
    constructor(datasetGenerator, initialFloor, summary='', description='', floorSize={x:0, y:0}) {
        this._datasetGenerator = datasetGenerator;
        this._initialFloor = initialFloor;
        this._summary = summary;
        this._description = description;
        this._floorSize = floorSize;
    }

    get summary() { return this._summary; }
    get description() { return this._description; }
    get floorSize() { return this._floorSize; }
    get initialFloor() { return this._initialFloor; }

    generate(seed=0) {
        return this._datasetGenerator(seed);
    }
}
