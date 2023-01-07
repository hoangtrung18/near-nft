import {
  NearBindgen,
  near,
  call,
  view,
  initialize,
  LookupMap,
} from "near-sdk-js";
import { AccountId } from "near-sdk-js/lib/types";
import { IToken } from "./interfaces/token.interface";
class Token {
  token_id: number;
  name: string;
  description: string;
  media_uri: string;
  constructor(payload: IToken) {
    this.token_id = payload.token_id;
    this.name = payload.name;
    this.description = payload.description;
    this.media_uri = payload.media_uri;
  }
}

@NearBindgen({})
class Contract {
  owner_id: AccountId;
  token_current_index: number;
  maxTotalSupply: number;
  owner_by_id: LookupMap<string>;
  token_by_id: LookupMap<any>;
  constructor() {
    this.token_current_index = 0;
    this.owner_id = "";
    this.maxTotalSupply = 1000;
    this.owner_by_id = new LookupMap("o");
    this.token_by_id = new LookupMap("t");
  }

  @initialize({})
  init({ owner_id }: { owner_id: AccountId }) {
    this.token_current_index = 1;
    this.owner_id = owner_id;
    this.owner_by_id = new LookupMap("o");
    this.token_by_id = new LookupMap("t");
  }

  @call({})
  mint_nft({ name, description, media_uri }: IToken): IToken {
    const newId = this.token_current_index.toString();
    this.owner_by_id.set(newId, near.predecessorAccountId());

    let token = new Token({
      token_id: this.token_current_index,
      name,
      description,
      media_uri,
    });

    this.token_by_id.set(newId, token);

    this.token_current_index += 1;
    return token;
  }

  @view({})
  get_token_by_id({ token_id }: { token_id: number }) {
    return this.token_by_id.get(token_id.toString());
  }

  @view({})
  get_supply_tokens() {
    return this.token_current_index;
  }

  @view({})
  get_owner_token_by_id({ token_id }: { token_id: number }) {
    return this.owner_by_id.get(token_id.toString());
  }

  @view({})
  get_max_total_supply() {
    return this.maxTotalSupply;
  }

  @view({})
  get_all_tokens({ start, max }: { start?: number; max?: number }) {
    var all_tokens = [];
    const _start = start || 0;

    const _end = Math.min(max + _start, this.token_current_index);

    for (let i = _start; i < _end; i++) {
      all_tokens.push(this.token_by_id.get(i.toString()));
    }

    return all_tokens;
  }
}
