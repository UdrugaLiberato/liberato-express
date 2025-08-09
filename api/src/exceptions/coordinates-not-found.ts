export default class CoordinatesNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CoordinatesNotFound';
  }
}
