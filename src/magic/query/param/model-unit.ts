import { JsonUnit } from './json-unit';
import { TOKEN_COUNT, TOKEN_GET_MANY, TOKEN_GET_ONE } from './keyword-tokens';
import { SkipCommand } from './skip-command';
import { TakeCommand } from './take-command';

export class ModelUnit {
  private _jsonUnit: JsonUnit;

  constructor(jsonUnit: JsonUnit) {
    this._jsonUnit = jsonUnit;
  }

  get model() {
    return this._jsonUnit.value;
  }

  get modelAlias() {
    return this.model?.toLowerCase();
  }

  getTakeCommand() {
    return this._jsonUnit.getTakeCommand()
      ? new TakeCommand(this._jsonUnit.getTakeCommand())
      : undefined;
  }

  getSkipCommand() {
    return this._jsonUnit.getSkipCommand()
      ? new SkipCommand(this._jsonUnit.getSkipCommand())
      : undefined;
  }

  get excuteString() {
    if (this._jsonUnit.getCommand(TOKEN_GET_ONE)) {
      return TOKEN_GET_ONE;
    }
    if (this._jsonUnit.getCommand(TOKEN_COUNT)) {
      return 'getManyAndCount';
    }
    return TOKEN_GET_MANY;
  }
}
