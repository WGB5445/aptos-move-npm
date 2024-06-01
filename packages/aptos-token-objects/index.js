"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// index.ts
var aptos_token_objects_exports = {};
__export(aptos_token_objects_exports, {
  default: () => aptos_token_objects_default
});
module.exports = __toCommonJS(aptos_token_objects_exports);
var aptos_token_objects_default = [{ "content": `/// This defines a minimally viable token for no-code solutions akin to the original token at
/// 0x3::token module.
/// The key features are:
/// * Base token and collection features
/// * Creator definable mutability for tokens
/// * Creator-based freezing of tokens
/// * Standard object-based transfer and events
/// * Metadata property type
module aptos_token_objects::aptos_token {
    use std::error;
    use std::option::{Self, Option};
    use std::string::String;
    use std::signer;
    use aptos_framework::object::{Self, ConstructorRef, Object};
    use aptos_token_objects::collection;
    use aptos_token_objects::property_map;
    use aptos_token_objects::royalty;
    use aptos_token_objects::token;

    /// The collection does not exist
    const ECOLLECTION_DOES_NOT_EXIST: u64 = 1;
    /// The token does not exist
    const ETOKEN_DOES_NOT_EXIST: u64 = 2;
    /// The provided signer is not the creator
    const ENOT_CREATOR: u64 = 3;
    /// The field being changed is not mutable
    const EFIELD_NOT_MUTABLE: u64 = 4;
    /// The token being burned is not burnable
    const ETOKEN_NOT_BURNABLE: u64 = 5;
    /// The property map being mutated is not mutable
    const EPROPERTIES_NOT_MUTABLE: u64 = 6;

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    /// Storage state for managing the no-code Collection.
    struct AptosCollection has key {
        /// Used to mutate collection fields
        mutator_ref: Option<collection::MutatorRef>,
        /// Used to mutate royalties
        royalty_mutator_ref: Option<royalty::MutatorRef>,
        /// Determines if the creator can mutate the collection's description
        mutable_description: bool,
        /// Determines if the creator can mutate the collection's uri
        mutable_uri: bool,
        /// Determines if the creator can mutate token descriptions
        mutable_token_description: bool,
        /// Determines if the creator can mutate token names
        mutable_token_name: bool,
        /// Determines if the creator can mutate token properties
        mutable_token_properties: bool,
        /// Determines if the creator can mutate token uris
        mutable_token_uri: bool,
        /// Determines if the creator can burn tokens
        tokens_burnable_by_creator: bool,
        /// Determines if the creator can freeze tokens
        tokens_freezable_by_creator: bool,
    }

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    /// Storage state for managing the no-code Token.
    struct AptosToken has key {
        /// Used to burn.
        burn_ref: Option<token::BurnRef>,
        /// Used to control freeze.
        transfer_ref: Option<object::TransferRef>,
        /// Used to mutate fields
        mutator_ref: Option<token::MutatorRef>,
        /// Used to mutate properties
        property_mutator_ref: property_map::MutatorRef,
    }

    /// Create a new collection
    public entry fun create_collection(
        creator: &signer,
        description: String,
        max_supply: u64,
        name: String,
        uri: String,
        mutable_description: bool,
        mutable_royalty: bool,
        mutable_uri: bool,
        mutable_token_description: bool,
        mutable_token_name: bool,
        mutable_token_properties: bool,
        mutable_token_uri: bool,
        tokens_burnable_by_creator: bool,
        tokens_freezable_by_creator: bool,
        royalty_numerator: u64,
        royalty_denominator: u64,
    ) {
        create_collection_object(
            creator,
            description,
            max_supply,
            name,
            uri,
            mutable_description,
            mutable_royalty,
            mutable_uri,
            mutable_token_description,
            mutable_token_name,
            mutable_token_properties,
            mutable_token_uri,
            tokens_burnable_by_creator,
            tokens_freezable_by_creator,
            royalty_numerator,
            royalty_denominator
        );
    }

    public fun create_collection_object(
        creator: &signer,
        description: String,
        max_supply: u64,
        name: String,
        uri: String,
        mutable_description: bool,
        mutable_royalty: bool,
        mutable_uri: bool,
        mutable_token_description: bool,
        mutable_token_name: bool,
        mutable_token_properties: bool,
        mutable_token_uri: bool,
        tokens_burnable_by_creator: bool,
        tokens_freezable_by_creator: bool,
        royalty_numerator: u64,
        royalty_denominator: u64,
    ): Object<AptosCollection> {
        let creator_addr = signer::address_of(creator);
        let royalty = royalty::create(royalty_numerator, royalty_denominator, creator_addr);
        let constructor_ref = collection::create_fixed_collection(
            creator,
            description,
            max_supply,
            name,
            option::some(royalty),
            uri,
        );

        let object_signer = object::generate_signer(&constructor_ref);
        let mutator_ref = if (mutable_description || mutable_uri) {
            option::some(collection::generate_mutator_ref(&constructor_ref))
        } else {
            option::none()
        };

        let royalty_mutator_ref = if (mutable_royalty) {
            option::some(royalty::generate_mutator_ref(object::generate_extend_ref(&constructor_ref)))
        } else {
            option::none()
        };

        let aptos_collection = AptosCollection {
            mutator_ref,
            royalty_mutator_ref,
            mutable_description,
            mutable_uri,
            mutable_token_description,
            mutable_token_name,
            mutable_token_properties,
            mutable_token_uri,
            tokens_burnable_by_creator,
            tokens_freezable_by_creator,
        };
        move_to(&object_signer, aptos_collection);
        object::object_from_constructor_ref(&constructor_ref)
    }

    /// With an existing collection, directly mint a viable token into the creators account.
    public entry fun mint(
        creator: &signer,
        collection: String,
        description: String,
        name: String,
        uri: String,
        property_keys: vector<String>,
        property_types: vector<String>,
        property_values: vector<vector<u8>>,
    ) acquires AptosCollection, AptosToken {
        mint_token_object(creator, collection, description, name, uri, property_keys, property_types, property_values);
    }

    /// Mint a token into an existing collection, and retrieve the object / address of the token.
    public fun mint_token_object(
        creator: &signer,
        collection: String,
        description: String,
        name: String,
        uri: String,
        property_keys: vector<String>,
        property_types: vector<String>,
        property_values: vector<vector<u8>>,
    ): Object<AptosToken> acquires AptosCollection, AptosToken {
        let constructor_ref = mint_internal(
            creator,
            collection,
            description,
            name,
            uri,
            property_keys,
            property_types,
            property_values,
        );

        let collection = collection_object(creator, &collection);

        // If tokens are freezable, add a transfer ref to be able to freeze transfers
        let freezable_by_creator = are_collection_tokens_freezable(collection);
        if (freezable_by_creator) {
            let aptos_token_addr = object::address_from_constructor_ref(&constructor_ref);
            let aptos_token = borrow_global_mut<AptosToken>(aptos_token_addr);
            let transfer_ref = object::generate_transfer_ref(&constructor_ref);
            option::fill(&mut aptos_token.transfer_ref, transfer_ref);
        };

        object::object_from_constructor_ref(&constructor_ref)
    }

    /// With an existing collection, directly mint a soul bound token into the recipient's account.
    public entry fun mint_soul_bound(
        creator: &signer,
        collection: String,
        description: String,
        name: String,
        uri: String,
        property_keys: vector<String>,
        property_types: vector<String>,
        property_values: vector<vector<u8>>,
        soul_bound_to: address,
    ) acquires AptosCollection {
        mint_soul_bound_token_object(
            creator,
            collection,
            description,
            name,
            uri,
            property_keys,
            property_types,
            property_values,
            soul_bound_to
        );
    }

    /// With an existing collection, directly mint a soul bound token into the recipient's account.
    public fun mint_soul_bound_token_object(
        creator: &signer,
        collection: String,
        description: String,
        name: String,
        uri: String,
        property_keys: vector<String>,
        property_types: vector<String>,
        property_values: vector<vector<u8>>,
        soul_bound_to: address,
    ): Object<AptosToken> acquires AptosCollection {
        let constructor_ref = mint_internal(
            creator,
            collection,
            description,
            name,
            uri,
            property_keys,
            property_types,
            property_values,
        );

        let transfer_ref = object::generate_transfer_ref(&constructor_ref);
        let linear_transfer_ref = object::generate_linear_transfer_ref(&transfer_ref);
        object::transfer_with_ref(linear_transfer_ref, soul_bound_to);
        object::disable_ungated_transfer(&transfer_ref);

        object::object_from_constructor_ref(&constructor_ref)
    }

    fun mint_internal(
        creator: &signer,
        collection: String,
        description: String,
        name: String,
        uri: String,
        property_keys: vector<String>,
        property_types: vector<String>,
        property_values: vector<vector<u8>>,
    ): ConstructorRef acquires AptosCollection {
        let constructor_ref = token::create(creator, collection, description, name, option::none(), uri);

        let object_signer = object::generate_signer(&constructor_ref);

        let collection_obj = collection_object(creator, &collection);
        let collection = borrow_collection(&collection_obj);

        let mutator_ref = if (
            collection.mutable_token_description
                || collection.mutable_token_name
                || collection.mutable_token_uri
        ) {
            option::some(token::generate_mutator_ref(&constructor_ref))
        } else {
            option::none()
        };

        let burn_ref = if (collection.tokens_burnable_by_creator) {
            option::some(token::generate_burn_ref(&constructor_ref))
        } else {
            option::none()
        };

        let aptos_token = AptosToken {
            burn_ref,
            transfer_ref: option::none(),
            mutator_ref,
            property_mutator_ref: property_map::generate_mutator_ref(&constructor_ref),
        };
        move_to(&object_signer, aptos_token);

        let properties = property_map::prepare_input(property_keys, property_types, property_values);
        property_map::init(&constructor_ref, properties);

        constructor_ref
    }

    // Token accessors

    inline fun borrow<T: key>(token: &Object<T>): &AptosToken {
        let token_address = object::object_address(token);
        assert!(
            exists<AptosToken>(token_address),
            error::not_found(ETOKEN_DOES_NOT_EXIST),
        );
        borrow_global<AptosToken>(token_address)
    }

    #[view]
    public fun are_properties_mutable<T: key>(token: Object<T>): bool acquires AptosCollection {
        let collection = token::collection_object(token);
        borrow_collection(&collection).mutable_token_properties
    }

    #[view]
    public fun is_burnable<T: key>(token: Object<T>): bool acquires AptosToken {
        option::is_some(&borrow(&token).burn_ref)
    }

    #[view]
    public fun is_freezable_by_creator<T: key>(token: Object<T>): bool acquires AptosCollection {
        are_collection_tokens_freezable(token::collection_object(token))
    }

    #[view]
    public fun is_mutable_description<T: key>(token: Object<T>): bool acquires AptosCollection {
        is_mutable_collection_token_description(token::collection_object(token))
    }

    #[view]
    public fun is_mutable_name<T: key>(token: Object<T>): bool acquires AptosCollection {
        is_mutable_collection_token_name(token::collection_object(token))
    }

    #[view]
    public fun is_mutable_uri<T: key>(token: Object<T>): bool acquires AptosCollection {
        is_mutable_collection_token_uri(token::collection_object(token))
    }

    // Token mutators

    inline fun authorized_borrow<T: key>(token: &Object<T>, creator: &signer): &AptosToken {
        let token_address = object::object_address(token);
        assert!(
            exists<AptosToken>(token_address),
            error::not_found(ETOKEN_DOES_NOT_EXIST),
        );

        assert!(
            token::creator(*token) == signer::address_of(creator),
            error::permission_denied(ENOT_CREATOR),
        );
        borrow_global<AptosToken>(token_address)
    }

    public entry fun burn<T: key>(creator: &signer, token: Object<T>) acquires AptosToken {
        let aptos_token = authorized_borrow(&token, creator);
        assert!(
            option::is_some(&aptos_token.burn_ref),
            error::permission_denied(ETOKEN_NOT_BURNABLE),
        );
        move aptos_token;
        let aptos_token = move_from<AptosToken>(object::object_address(&token));
        let AptosToken {
            burn_ref,
            transfer_ref: _,
            mutator_ref: _,
            property_mutator_ref,
        } = aptos_token;
        property_map::burn(property_mutator_ref);
        token::burn(option::extract(&mut burn_ref));
    }

    public entry fun freeze_transfer<T: key>(creator: &signer, token: Object<T>) acquires AptosCollection, AptosToken {
        let aptos_token = authorized_borrow(&token, creator);
        assert!(
            are_collection_tokens_freezable(token::collection_object(token))
                && option::is_some(&aptos_token.transfer_ref),
            error::permission_denied(EFIELD_NOT_MUTABLE),
        );
        object::disable_ungated_transfer(option::borrow(&aptos_token.transfer_ref));
    }

    public entry fun unfreeze_transfer<T: key>(
        creator: &signer,
        token: Object<T>
    ) acquires AptosCollection, AptosToken {
        let aptos_token = authorized_borrow(&token, creator);
        assert!(
            are_collection_tokens_freezable(token::collection_object(token))
                && option::is_some(&aptos_token.transfer_ref),
            error::permission_denied(EFIELD_NOT_MUTABLE),
        );
        object::enable_ungated_transfer(option::borrow(&aptos_token.transfer_ref));
    }

    public entry fun set_description<T: key>(
        creator: &signer,
        token: Object<T>,
        description: String,
    ) acquires AptosCollection, AptosToken {
        assert!(
            is_mutable_description(token),
            error::permission_denied(EFIELD_NOT_MUTABLE),
        );
        let aptos_token = authorized_borrow(&token, creator);
        token::set_description(option::borrow(&aptos_token.mutator_ref), description);
    }

    public entry fun set_name<T: key>(
        creator: &signer,
        token: Object<T>,
        name: String,
    ) acquires AptosCollection, AptosToken {
        assert!(
            is_mutable_name(token),
            error::permission_denied(EFIELD_NOT_MUTABLE),
        );
        let aptos_token = authorized_borrow(&token, creator);
        token::set_name(option::borrow(&aptos_token.mutator_ref), name);
    }

    public entry fun set_uri<T: key>(
        creator: &signer,
        token: Object<T>,
        uri: String,
    ) acquires AptosCollection, AptosToken {
        assert!(
            is_mutable_uri(token),
            error::permission_denied(EFIELD_NOT_MUTABLE),
        );
        let aptos_token = authorized_borrow(&token, creator);
        token::set_uri(option::borrow(&aptos_token.mutator_ref), uri);
    }

    public entry fun add_property<T: key>(
        creator: &signer,
        token: Object<T>,
        key: String,
        type: String,
        value: vector<u8>,
    ) acquires AptosCollection, AptosToken {
        let aptos_token = authorized_borrow(&token, creator);
        assert!(
            are_properties_mutable(token),
            error::permission_denied(EPROPERTIES_NOT_MUTABLE),
        );

        property_map::add(&aptos_token.property_mutator_ref, key, type, value);
    }

    public entry fun add_typed_property<T: key, V: drop>(
        creator: &signer,
        token: Object<T>,
        key: String,
        value: V,
    ) acquires AptosCollection, AptosToken {
        let aptos_token = authorized_borrow(&token, creator);
        assert!(
            are_properties_mutable(token),
            error::permission_denied(EPROPERTIES_NOT_MUTABLE),
        );

        property_map::add_typed(&aptos_token.property_mutator_ref, key, value);
    }

    public entry fun remove_property<T: key>(
        creator: &signer,
        token: Object<T>,
        key: String,
    ) acquires AptosCollection, AptosToken {
        let aptos_token = authorized_borrow(&token, creator);
        assert!(
            are_properties_mutable(token),
            error::permission_denied(EPROPERTIES_NOT_MUTABLE),
        );

        property_map::remove(&aptos_token.property_mutator_ref, &key);
    }

    public entry fun update_property<T: key>(
        creator: &signer,
        token: Object<T>,
        key: String,
        type: String,
        value: vector<u8>,
    ) acquires AptosCollection, AptosToken {
        let aptos_token = authorized_borrow(&token, creator);
        assert!(
            are_properties_mutable(token),
            error::permission_denied(EPROPERTIES_NOT_MUTABLE),
        );

        property_map::update(&aptos_token.property_mutator_ref, &key, type, value);
    }

    public entry fun update_typed_property<T: key, V: drop>(
        creator: &signer,
        token: Object<T>,
        key: String,
        value: V,
    ) acquires AptosCollection, AptosToken {
        let aptos_token = authorized_borrow(&token, creator);
        assert!(
            are_properties_mutable(token),
            error::permission_denied(EPROPERTIES_NOT_MUTABLE),
        );

        property_map::update_typed(&aptos_token.property_mutator_ref, &key, value);
    }

    // Collection accessors

    inline fun collection_object(creator: &signer, name: &String): Object<AptosCollection> {
        let collection_addr = collection::create_collection_address(&signer::address_of(creator), name);
        object::address_to_object<AptosCollection>(collection_addr)
    }

    inline fun borrow_collection<T: key>(token: &Object<T>): &AptosCollection {
        let collection_address = object::object_address(token);
        assert!(
            exists<AptosCollection>(collection_address),
            error::not_found(ECOLLECTION_DOES_NOT_EXIST),
        );
        borrow_global<AptosCollection>(collection_address)
    }

    public fun is_mutable_collection_description<T: key>(
        collection: Object<T>,
    ): bool acquires AptosCollection {
        borrow_collection(&collection).mutable_description
    }

    public fun is_mutable_collection_royalty<T: key>(
        collection: Object<T>,
    ): bool acquires AptosCollection {
        option::is_some(&borrow_collection(&collection).royalty_mutator_ref)
    }

    public fun is_mutable_collection_uri<T: key>(
        collection: Object<T>,
    ): bool acquires AptosCollection {
        borrow_collection(&collection).mutable_uri
    }

    public fun is_mutable_collection_token_description<T: key>(
        collection: Object<T>,
    ): bool acquires AptosCollection {
        borrow_collection(&collection).mutable_token_description
    }

    public fun is_mutable_collection_token_name<T: key>(
        collection: Object<T>,
    ): bool acquires AptosCollection {
        borrow_collection(&collection).mutable_token_name
    }

    public fun is_mutable_collection_token_uri<T: key>(
        collection: Object<T>,
    ): bool acquires AptosCollection {
        borrow_collection(&collection).mutable_token_uri
    }

    public fun is_mutable_collection_token_properties<T: key>(
        collection: Object<T>,
    ): bool acquires AptosCollection {
        borrow_collection(&collection).mutable_token_properties
    }

    public fun are_collection_tokens_burnable<T: key>(
        collection: Object<T>,
    ): bool acquires AptosCollection {
        borrow_collection(&collection).tokens_burnable_by_creator
    }

    public fun are_collection_tokens_freezable<T: key>(
        collection: Object<T>,
    ): bool acquires AptosCollection {
        borrow_collection(&collection).tokens_freezable_by_creator
    }

    // Collection mutators

    inline fun authorized_borrow_collection<T: key>(collection: &Object<T>, creator: &signer): &AptosCollection {
        let collection_address = object::object_address(collection);
        assert!(
            exists<AptosCollection>(collection_address),
            error::not_found(ECOLLECTION_DOES_NOT_EXIST),
        );
        assert!(
            collection::creator(*collection) == signer::address_of(creator),
            error::permission_denied(ENOT_CREATOR),
        );
        borrow_global<AptosCollection>(collection_address)
    }

    public entry fun set_collection_description<T: key>(
        creator: &signer,
        collection: Object<T>,
        description: String,
    ) acquires AptosCollection {
        let aptos_collection = authorized_borrow_collection(&collection, creator);
        assert!(
            aptos_collection.mutable_description,
            error::permission_denied(EFIELD_NOT_MUTABLE),
        );
        collection::set_description(option::borrow(&aptos_collection.mutator_ref), description);
    }

    public fun set_collection_royalties<T: key>(
        creator: &signer,
        collection: Object<T>,
        royalty: royalty::Royalty,
    ) acquires AptosCollection {
        let aptos_collection = authorized_borrow_collection(&collection, creator);
        assert!(
            option::is_some(&aptos_collection.royalty_mutator_ref),
            error::permission_denied(EFIELD_NOT_MUTABLE),
        );
        royalty::update(option::borrow(&aptos_collection.royalty_mutator_ref), royalty);
    }

    entry fun set_collection_royalties_call<T: key>(
        creator: &signer,
        collection: Object<T>,
        royalty_numerator: u64,
        royalty_denominator: u64,
        payee_address: address,
    ) acquires AptosCollection {
        let royalty = royalty::create(royalty_numerator, royalty_denominator, payee_address);
        set_collection_royalties(creator, collection, royalty);
    }

    public entry fun set_collection_uri<T: key>(
        creator: &signer,
        collection: Object<T>,
        uri: String,
    ) acquires AptosCollection {
        let aptos_collection = authorized_borrow_collection(&collection, creator);
        assert!(
            aptos_collection.mutable_uri,
            error::permission_denied(EFIELD_NOT_MUTABLE),
        );
        collection::set_uri(option::borrow(&aptos_collection.mutator_ref), uri);
    }

    // Tests

    #[test_only]
    use std::string;
    #[test_only]
    use aptos_framework::account;

    #[test(creator = @0x123)]
    fun test_create_and_transfer(creator: &signer) acquires AptosCollection, AptosToken {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, true);
        let token = mint_helper(creator, collection_name, token_name);

        assert!(object::owner(token) == signer::address_of(creator), 1);
        object::transfer(creator, token, @0x345);
        assert!(object::owner(token) == @0x345, 1);
    }

    #[test(creator = @0x123, bob = @0x456)]
    #[expected_failure(abort_code = 0x50003, location = object)]
    fun test_mint_soul_bound(creator: &signer, bob: &signer) acquires AptosCollection {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, false);

        let creator_addr = signer::address_of(creator);
        account::create_account_for_test(creator_addr);

        let token = mint_soul_bound_token_object(
            creator,
            collection_name,
            string::utf8(b""),
            token_name,
            string::utf8(b""),
            vector[],
            vector[],
            vector[],
            signer::address_of(bob),
        );

        object::transfer(bob, token, @0x345);
    }

    #[test(creator = @0x123)]
    #[expected_failure(abort_code = 0x50003, location = object)]
    fun test_frozen_transfer(creator: &signer) acquires AptosCollection, AptosToken {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, true);
        let token = mint_helper(creator, collection_name, token_name);
        freeze_transfer(creator, token);
        object::transfer(creator, token, @0x345);
    }

    #[test(creator = @0x123)]
    fun test_unfrozen_transfer(creator: &signer) acquires AptosCollection, AptosToken {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, true);
        let token = mint_helper(creator, collection_name, token_name);
        freeze_transfer(creator, token);
        unfreeze_transfer(creator, token);
        object::transfer(creator, token, @0x345);
    }

    #[test(creator = @0x123, another = @0x456)]
    #[expected_failure(abort_code = 0x50003, location = Self)]
    fun test_noncreator_freeze(creator: &signer, another: &signer) acquires AptosCollection, AptosToken {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, true);
        let token = mint_helper(creator, collection_name, token_name);
        freeze_transfer(another, token);
    }

    #[test(creator = @0x123, another = @0x456)]
    #[expected_failure(abort_code = 0x50003, location = Self)]
    fun test_noncreator_unfreeze(creator: &signer, another: &signer) acquires AptosCollection, AptosToken {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, true);
        let token = mint_helper(creator, collection_name, token_name);
        freeze_transfer(creator, token);
        unfreeze_transfer(another, token);
    }

    #[test(creator = @0x123)]
    fun test_set_description(creator: &signer) acquires AptosCollection, AptosToken {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, true);
        let token = mint_helper(creator, collection_name, token_name);

        let description = string::utf8(b"not");
        assert!(token::description(token) != description, 0);
        set_description(creator, token, description);
        assert!(token::description(token) == description, 1);
    }

    #[test(creator = @0x123)]
    #[expected_failure(abort_code = 0x50004, location = Self)]
    fun test_set_immutable_description(creator: &signer) acquires AptosCollection, AptosToken {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, false);
        let token = mint_helper(creator, collection_name, token_name);

        set_description(creator, token, string::utf8(b""));
    }

    #[test(creator = @0x123, noncreator = @0x456)]
    #[expected_failure(abort_code = 0x50003, location = Self)]
    fun test_set_description_non_creator(
        creator: &signer,
        noncreator: &signer,
    ) acquires AptosCollection, AptosToken {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, true);
        let token = mint_helper(creator, collection_name, token_name);

        let description = string::utf8(b"not");
        set_description(noncreator, token, description);
    }

    #[test(creator = @0x123)]
    fun test_set_name(creator: &signer) acquires AptosCollection, AptosToken {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, true);
        let token = mint_helper(creator, collection_name, token_name);

        let name = string::utf8(b"not");
        assert!(token::name(token) != name, 0);
        set_name(creator, token, name);
        assert!(token::name(token) == name, 1);
    }

    #[test(creator = @0x123)]
    #[expected_failure(abort_code = 0x50004, location = Self)]
    fun test_set_immutable_name(creator: &signer) acquires AptosCollection, AptosToken {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, false);
        let token = mint_helper(creator, collection_name, token_name);

        set_name(creator, token, string::utf8(b""));
    }

    #[test(creator = @0x123, noncreator = @0x456)]
    #[expected_failure(abort_code = 0x50003, location = Self)]
    fun test_set_name_non_creator(
        creator: &signer,
        noncreator: &signer,
    ) acquires AptosCollection, AptosToken {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, true);
        let token = mint_helper(creator, collection_name, token_name);

        let name = string::utf8(b"not");
        set_name(noncreator, token, name);
    }

    #[test(creator = @0x123)]
    fun test_set_uri(creator: &signer) acquires AptosCollection, AptosToken {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, true);
        let token = mint_helper(creator, collection_name, token_name);

        let uri = string::utf8(b"not");
        assert!(token::uri(token) != uri, 0);
        set_uri(creator, token, uri);
        assert!(token::uri(token) == uri, 1);
    }

    #[test(creator = @0x123)]
    #[expected_failure(abort_code = 0x50004, location = Self)]
    fun test_set_immutable_uri(creator: &signer) acquires AptosCollection, AptosToken {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, false);
        let token = mint_helper(creator, collection_name, token_name);

        set_uri(creator, token, string::utf8(b""));
    }

    #[test(creator = @0x123, noncreator = @0x456)]
    #[expected_failure(abort_code = 0x50003, location = Self)]
    fun test_set_uri_non_creator(
        creator: &signer,
        noncreator: &signer,
    ) acquires AptosCollection, AptosToken {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, true);
        let token = mint_helper(creator, collection_name, token_name);

        let uri = string::utf8(b"not");
        set_uri(noncreator, token, uri);
    }

    #[test(creator = @0x123)]
    fun test_burnable(creator: &signer) acquires AptosCollection, AptosToken {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, true);
        let token = mint_helper(creator, collection_name, token_name);
        let token_addr = object::object_address(&token);

        assert!(exists<AptosToken>(token_addr), 0);
        burn(creator, token);
        assert!(!exists<AptosToken>(token_addr), 1);
    }

    #[test(creator = @0x123)]
    #[expected_failure(abort_code = 0x50005, location = Self)]
    fun test_not_burnable(creator: &signer) acquires AptosCollection, AptosToken {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, false);
        let token = mint_helper(creator, collection_name, token_name);

        burn(creator, token);
    }

    #[test(creator = @0x123, noncreator = @0x456)]
    #[expected_failure(abort_code = 0x50003, location = Self)]
    fun test_burn_non_creator(
        creator: &signer,
        noncreator: &signer,
    ) acquires AptosCollection, AptosToken {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, true);
        let token = mint_helper(creator, collection_name, token_name);

        burn(noncreator, token);
    }

    #[test(creator = @0x123)]
    fun test_set_collection_description(creator: &signer) acquires AptosCollection {
        let collection_name = string::utf8(b"collection name");
        let collection = create_collection_helper(creator, collection_name, true);
        let value = string::utf8(b"not");
        assert!(collection::description(collection) != value, 0);
        set_collection_description(creator, collection, value);
        assert!(collection::description(collection) == value, 1);
    }

    #[test(creator = @0x123)]
    #[expected_failure(abort_code = 0x50004, location = Self)]
    fun test_set_immutable_collection_description(creator: &signer) acquires AptosCollection {
        let collection_name = string::utf8(b"collection name");
        let collection = create_collection_helper(creator, collection_name, false);
        set_collection_description(creator, collection, string::utf8(b""));
    }

    #[test(creator = @0x123, noncreator = @0x456)]
    #[expected_failure(abort_code = 0x50003, location = Self)]
    fun test_set_collection_description_non_creator(
        creator: &signer,
        noncreator: &signer,
    ) acquires AptosCollection {
        let collection_name = string::utf8(b"collection name");
        let collection = create_collection_helper(creator, collection_name, true);
        set_collection_description(noncreator, collection, string::utf8(b""));
    }

    #[test(creator = @0x123)]
    fun test_set_collection_uri(creator: &signer) acquires AptosCollection {
        let collection_name = string::utf8(b"collection name");
        let collection = create_collection_helper(creator, collection_name, true);
        let value = string::utf8(b"not");
        assert!(collection::uri(collection) != value, 0);
        set_collection_uri(creator, collection, value);
        assert!(collection::uri(collection) == value, 1);
    }

    #[test(creator = @0x123)]
    #[expected_failure(abort_code = 0x50004, location = Self)]
    fun test_set_immutable_collection_uri(creator: &signer) acquires AptosCollection {
        let collection_name = string::utf8(b"collection name");
        let collection = create_collection_helper(creator, collection_name, false);
        set_collection_uri(creator, collection, string::utf8(b""));
    }

    #[test(creator = @0x123, noncreator = @0x456)]
    #[expected_failure(abort_code = 0x50003, location = Self)]
    fun test_set_collection_uri_non_creator(
        creator: &signer,
        noncreator: &signer,
    ) acquires AptosCollection {
        let collection_name = string::utf8(b"collection name");
        let collection = create_collection_helper(creator, collection_name, true);
        set_collection_uri(noncreator, collection, string::utf8(b""));
    }

    #[test(creator = @0x123)]
    fun test_property_add(creator: &signer) acquires AptosCollection, AptosToken {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");
        let property_name = string::utf8(b"u8");
        let property_type = string::utf8(b"u8");

        create_collection_helper(creator, collection_name, true);
        let token = mint_helper(creator, collection_name, token_name);
        add_property(creator, token, property_name, property_type, vector [ 0x08 ]);

        assert!(property_map::read_u8(&token, &property_name) == 0x8, 0);
    }

    #[test(creator = @0x123)]
    fun test_property_typed_add(creator: &signer) acquires AptosCollection, AptosToken {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");
        let property_name = string::utf8(b"u8");

        create_collection_helper(creator, collection_name, true);
        let token = mint_helper(creator, collection_name, token_name);
        add_typed_property<AptosToken, u8>(creator, token, property_name, 0x8);

        assert!(property_map::read_u8(&token, &property_name) == 0x8, 0);
    }

    #[test(creator = @0x123)]
    fun test_property_update(creator: &signer) acquires AptosCollection, AptosToken {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");
        let property_name = string::utf8(b"bool");
        let property_type = string::utf8(b"bool");

        create_collection_helper(creator, collection_name, true);
        let token = mint_helper(creator, collection_name, token_name);
        update_property(creator, token, property_name, property_type, vector [ 0x00 ]);

        assert!(!property_map::read_bool(&token, &property_name), 0);
    }

    #[test(creator = @0x123)]
    fun test_property_update_typed(creator: &signer) acquires AptosCollection, AptosToken {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");
        let property_name = string::utf8(b"bool");

        create_collection_helper(creator, collection_name, true);
        let token = mint_helper(creator, collection_name, token_name);
        update_typed_property<AptosToken, bool>(creator, token, property_name, false);

        assert!(!property_map::read_bool(&token, &property_name), 0);
    }

    #[test(creator = @0x123)]
    fun test_property_remove(creator: &signer) acquires AptosCollection, AptosToken {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");
        let property_name = string::utf8(b"bool");

        create_collection_helper(creator, collection_name, true);
        let token = mint_helper(creator, collection_name, token_name);
        remove_property(creator, token, property_name);
    }

    #[test(creator = @0x123)]
    fun test_royalties(creator: &signer) acquires AptosCollection, AptosToken {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        let collection = create_collection_helper(creator, collection_name, true);
        let token = mint_helper(creator, collection_name, token_name);

        let royalty_before = option::extract(&mut token::royalty(token));
        set_collection_royalties_call(creator, collection, 2, 3, @0x444);
        let royalty_after = option::extract(&mut token::royalty(token));
        assert!(royalty_before != royalty_after, 0);
    }

    #[test_only]
    fun create_collection_helper(
        creator: &signer,
        collection_name: String,
        flag: bool,
    ): Object<AptosCollection> {
        create_collection_object(
            creator,
            string::utf8(b"collection description"),
            1,
            collection_name,
            string::utf8(b"collection uri"),
            flag,
            flag,
            flag,
            flag,
            flag,
            flag,
            flag,
            flag,
            flag,
            1,
            100,
        )
    }

    #[test_only]
    fun mint_helper(
        creator: &signer,
        collection_name: String,
        token_name: String,
    ): Object<AptosToken> acquires AptosCollection, AptosToken {
        let creator_addr = signer::address_of(creator);
        account::create_account_for_test(creator_addr);

        mint_token_object(
            creator,
            collection_name,
            string::utf8(b"description"),
            token_name,
            string::utf8(b"uri"),
            vector[string::utf8(b"bool")],
            vector[string::utf8(b"bool")],
            vector[vector[0x01]],
        )
    }
}
`, "name": "aptos_token.move" }, { "content": `/// This defines an object-based Collection. A collection acts as a set organizer for a group of
/// tokens. This includes aspects such as a general description, project URI, name, and may contain
/// other useful generalizations across this set of tokens.
///
/// Being built upon objects enables collections to be relatively flexible. As core primitives it
/// supports:
/// * Common fields: name, uri, description, creator
/// * MutatorRef leaving mutability configuration to a higher level component
/// * Addressed by a global identifier of creator's address and collection name, thus collections
///   cannot be deleted as a restriction of the object model.
/// * Optional support for collection-wide royalties
/// * Optional support for tracking of supply with events on mint or burn
///
/// TODO:
/// * Consider supporting changing the name of the collection with the MutatorRef. This would
///   require adding the field original_name.
/// * Consider supporting changing the aspects of supply with the MutatorRef.
/// * Add aggregator support when added to framework
module aptos_token_objects::collection {
    use std::error;
    use std::features;
    use std::option::{Self, Option};
    use std::signer;
    use std::string::{Self, String};
    use aptos_framework::aggregator_v2::{Self, Aggregator, AggregatorSnapshot};
    use aptos_framework::event;
    use aptos_framework::object::{Self, ConstructorRef, ExtendRef, Object};

    use aptos_token_objects::royalty::{Self, Royalty};

    friend aptos_token_objects::token;

    /// The collection does not exist
    const ECOLLECTION_DOES_NOT_EXIST: u64 = 1;
    /// The collection has reached its supply and no more tokens can be minted, unless some are burned
    const ECOLLECTION_SUPPLY_EXCEEDED: u64 = 2;
    /// The collection name is over the maximum length
    const ECOLLECTION_NAME_TOO_LONG: u64 = 3;
    /// The URI is over the maximum length
    const EURI_TOO_LONG: u64 = 4;
    /// The description is over the maximum length
    const EDESCRIPTION_TOO_LONG: u64 = 5;
    /// The max supply must be positive
    const EMAX_SUPPLY_CANNOT_BE_ZERO: u64 = 6;
    /// Concurrent feature flag is not yet enabled, so the function cannot be performed
    const ECONCURRENT_NOT_ENABLED: u64 = 7;
    /// Tried upgrading collection to concurrent, but collection is already concurrent
    const EALREADY_CONCURRENT: u64 = 8;
    /// The new max supply cannot be less than the current supply
    const EINVALID_MAX_SUPPLY: u64 = 9;
    /// The collection does not have a max supply
    const ENO_MAX_SUPPLY_IN_COLLECTION: u64 = 10;

    const MAX_COLLECTION_NAME_LENGTH: u64 = 128;
    const MAX_URI_LENGTH: u64 = 512;
    const MAX_DESCRIPTION_LENGTH: u64 = 2048;

    const MAX_U64: u64 = 18446744073709551615;

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    /// Represents the common fields for a collection.
    struct Collection has key {
        /// The creator of this collection.
        creator: address,
        /// A brief description of the collection.
        description: String,
        /// An optional categorization of similar token.
        name: String,
        /// The Uniform Resource Identifier (uri) pointing to the JSON file stored in off-chain
        /// storage; the URL length will likely need a maximum any suggestions?
        uri: String,
        /// Emitted upon any mutation of the collection.
        mutation_events: event::EventHandle<MutationEvent>,
    }

    /// This enables mutating description and URI by higher level services.
    struct MutatorRef has drop, store {
        self: address,
    }

    /// Contains the mutated fields name. This makes the life of indexers easier, so that they can
    /// directly understand the behavior in a writeset.
    struct MutationEvent has drop, store {
        mutated_field_name: String,
    }

    #[event]
    /// Contains the mutated fields name. This makes the life of indexers easier, so that they can
    /// directly understand the behavior in a writeset.
    struct Mutation has drop, store {
        mutated_field_name: String,
        collection: Object<Collection>,
        old_value: String,
        new_value: String,
    }

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    /// Fixed supply tracker, this is useful for ensuring that a limited number of tokens are minted.
    /// and adding events and supply tracking to a collection.
    struct FixedSupply has key {
        /// Total minted - total burned
        current_supply: u64,
        max_supply: u64,
        total_minted: u64,
        /// Emitted upon burning a Token.
        burn_events: event::EventHandle<BurnEvent>,
        /// Emitted upon minting an Token.
        mint_events: event::EventHandle<MintEvent>,
    }

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    /// Unlimited supply tracker, this is useful for adding events and supply tracking to a collection.
    struct UnlimitedSupply has key {
        current_supply: u64,
        total_minted: u64,
        /// Emitted upon burning a Token.
        burn_events: event::EventHandle<BurnEvent>,
        /// Emitted upon minting an Token.
        mint_events: event::EventHandle<MintEvent>,
    }

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    /// Supply tracker, useful for tracking amount of issued tokens.
    /// If max_value is not set to U64_MAX, this ensures that a limited number of tokens are minted.
    struct ConcurrentSupply has key {
        /// Total minted - total burned
        current_supply: Aggregator<u64>,
        total_minted: Aggregator<u64>,
    }

    struct BurnEvent has drop, store {
        index: u64,
        token: address,
    }

    struct MintEvent has drop, store {
        index: u64,
        token: address,
    }

    #[event]
    struct Burn has drop, store {
        collection: address,
        index: u64,
        token: address,
        previous_owner: address,
    }

    #[event]
    struct Mint has drop, store {
        collection: address,
        index: AggregatorSnapshot<u64>,
        token: address,
    }

    // DEPRECATED, NEVER USED
    #[deprecated]
    #[event]
    struct ConcurrentBurnEvent has drop, store {
        collection_addr: address,
        index: u64,
        token: address,
    }

    // DEPRECATED, NEVER USED
    #[deprecated]
    #[event]
    struct ConcurrentMintEvent has drop, store {
        collection_addr: address,
        index: AggregatorSnapshot<u64>,
        token: address,
    }

    #[event]
    struct SetMaxSupply has drop, store {
        collection: Object<Collection>,
        old_max_supply: u64,
        new_max_supply: u64,
    }

    /// Creates a fixed-sized collection, or a collection that supports a fixed amount of tokens.
    /// This is useful to create a guaranteed, limited supply on-chain digital asset. For example,
    /// a collection 1111 vicious vipers. Note, creating restrictions such as upward limits results
    /// in data structures that prevent Aptos from parallelizing mints of this collection type.
    /// Beyond that, it adds supply tracking with events.
    public fun create_fixed_collection(
        creator: &signer,
        description: String,
        max_supply: u64,
        name: String,
        royalty: Option<Royalty>,
        uri: String,
    ): ConstructorRef {
        assert!(max_supply != 0, error::invalid_argument(EMAX_SUPPLY_CANNOT_BE_ZERO));
        let collection_seed = create_collection_seed(&name);
        let constructor_ref = object::create_named_object(creator, collection_seed);
        let object_signer = object::generate_signer(&constructor_ref);
        if (features::concurrent_token_v2_enabled()) {
            let supply = ConcurrentSupply {
                current_supply: aggregator_v2::create_aggregator(max_supply),
                total_minted: aggregator_v2::create_unbounded_aggregator(),
            };

            create_collection_internal(
                creator,
                constructor_ref,
                description,
                name,
                royalty,
                uri,
                option::some(supply),
            )
        } else {
            let supply = FixedSupply {
                current_supply: 0,
                max_supply,
                total_minted: 0,
                burn_events: object::new_event_handle(&object_signer),
                mint_events: object::new_event_handle(&object_signer),
            };

            create_collection_internal(
                creator,
                constructor_ref,
                description,
                name,
                royalty,
                uri,
                option::some(supply),
            )
        }
    }

    /// Creates an unlimited collection. This has support for supply tracking but does not limit
    /// the supply of tokens.
    public fun create_unlimited_collection(
        creator: &signer,
        description: String,
        name: String,
        royalty: Option<Royalty>,
        uri: String,
    ): ConstructorRef {
        let collection_seed = create_collection_seed(&name);
        let constructor_ref = object::create_named_object(creator, collection_seed);
        let object_signer = object::generate_signer(&constructor_ref);

        if (features::concurrent_token_v2_enabled()) {
            let supply = ConcurrentSupply {
                current_supply: aggregator_v2::create_unbounded_aggregator(),
                total_minted: aggregator_v2::create_unbounded_aggregator(),
            };

            create_collection_internal(
                creator,
                constructor_ref,
                description,
                name,
                royalty,
                uri,
                option::some(supply),
            )
        } else {
            let supply = UnlimitedSupply {
                current_supply: 0,
                total_minted: 0,
                burn_events: object::new_event_handle(&object_signer),
                mint_events: object::new_event_handle(&object_signer),
            };

            create_collection_internal(
                creator,
                constructor_ref,
                description,
                name,
                royalty,
                uri,
                option::some(supply),
            )
        }
    }

    /// Creates an untracked collection, or a collection that supports an arbitrary amount of
    /// tokens. This is useful for mass airdrops that fully leverage Aptos parallelization.
    /// TODO: Hide this until we bring back meaningful way to enforce burns
    fun create_untracked_collection(
        creator: &signer,
        description: String,
        name: String,
        royalty: Option<Royalty>,
        uri: String,
    ): ConstructorRef {
        let collection_seed = create_collection_seed(&name);
        let constructor_ref = object::create_named_object(creator, collection_seed);

        create_collection_internal<FixedSupply>(
            creator,
            constructor_ref,
            description,
            name,
            royalty,
            uri,
            option::none(),
        )
    }

    inline fun create_collection_internal<Supply: key>(
        creator: &signer,
        constructor_ref: ConstructorRef,
        description: String,
        name: String,
        royalty: Option<Royalty>,
        uri: String,
        supply: Option<Supply>,
    ): ConstructorRef {
        assert!(string::length(&name) <= MAX_COLLECTION_NAME_LENGTH, error::out_of_range(ECOLLECTION_NAME_TOO_LONG));
        assert!(string::length(&uri) <= MAX_URI_LENGTH, error::out_of_range(EURI_TOO_LONG));
        assert!(string::length(&description) <= MAX_DESCRIPTION_LENGTH, error::out_of_range(EDESCRIPTION_TOO_LONG));

        let object_signer = object::generate_signer(&constructor_ref);

        let collection = Collection {
            creator: signer::address_of(creator),
            description,
            name,
            uri,
            mutation_events: object::new_event_handle(&object_signer),
        };
        move_to(&object_signer, collection);

        if (option::is_some(&supply)) {
            move_to(&object_signer, option::destroy_some(supply))
        } else {
            option::destroy_none(supply)
        };

        if (option::is_some(&royalty)) {
            royalty::init(&constructor_ref, option::extract(&mut royalty))
        };

        let transfer_ref = object::generate_transfer_ref(&constructor_ref);
        object::disable_ungated_transfer(&transfer_ref);

        constructor_ref
    }

    /// Generates the collections address based upon the creators address and the collection's name
    public fun create_collection_address(creator: &address, name: &String): address {
        object::create_object_address(creator, create_collection_seed(name))
    }

    /// Named objects are derived from a seed, the collection's seed is its name.
    public fun create_collection_seed(name: &String): vector<u8> {
        assert!(string::length(name) <= MAX_COLLECTION_NAME_LENGTH, error::out_of_range(ECOLLECTION_NAME_TOO_LONG));
        *string::bytes(name)
    }

    /// Called by token on mint to increment supply if there's an appropriate Supply struct.
    /// TODO[agg_v2](cleanup): remove in a future release. We need to have both functions, as
    /// increment_concurrent_supply cannot be used until AGGREGATOR_API_V2 is enabled.
    public(friend) fun increment_supply(
        collection: &Object<Collection>,
        token: address,
    ): Option<u64> acquires FixedSupply, UnlimitedSupply {
        let collection_addr = object::object_address(collection);
        if (exists<FixedSupply>(collection_addr)) {
            let supply = borrow_global_mut<FixedSupply>(collection_addr);
            supply.current_supply = supply.current_supply + 1;
            supply.total_minted = supply.total_minted + 1;
            assert!(
                supply.current_supply <= supply.max_supply,
                error::out_of_range(ECOLLECTION_SUPPLY_EXCEEDED),
            );

            if (std::features::module_event_migration_enabled()) {
                event::emit(
                    Mint {
                        collection: collection_addr,
                        index: aggregator_v2::create_snapshot(supply.total_minted),
                        token,
                    },
                );
            };
            event::emit_event(&mut supply.mint_events,
                MintEvent {
                    index: supply.total_minted,
                    token,
                },
            );
            option::some(supply.total_minted)
        } else if (exists<UnlimitedSupply>(collection_addr)) {
            let supply = borrow_global_mut<UnlimitedSupply>(collection_addr);
            supply.current_supply = supply.current_supply + 1;
            supply.total_minted = supply.total_minted + 1;
            if (std::features::module_event_migration_enabled()) {
                event::emit(
                    Mint {
                        collection: collection_addr,
                        index: aggregator_v2::create_snapshot(supply.total_minted),
                        token,
                    },
                );
            };
            event::emit_event(
                &mut supply.mint_events,
                MintEvent {
                    index: supply.total_minted,
                    token,
                },
            );
            option::some(supply.total_minted)
        } else if (exists<ConcurrentSupply>(collection_addr)) {
            abort error::invalid_argument(ECONCURRENT_NOT_ENABLED)
        } else {
            option::none()
        }
    }

    /// Called by token on mint to increment supply if there's an appropriate Supply struct.
    public(friend) fun increment_concurrent_supply(
        collection: &Object<Collection>,
        token: address,
    ): Option<AggregatorSnapshot<u64>> acquires FixedSupply, UnlimitedSupply, ConcurrentSupply {
        let collection_addr = object::object_address(collection);
        if (exists<ConcurrentSupply>(collection_addr)) {
            let supply = borrow_global_mut<ConcurrentSupply>(collection_addr);
            assert!(
                aggregator_v2::try_add(&mut supply.current_supply, 1),
                error::out_of_range(ECOLLECTION_SUPPLY_EXCEEDED),
            );
            aggregator_v2::add(&mut supply.total_minted, 1);
            event::emit(
                Mint {
                    collection: collection_addr,
                    index: aggregator_v2::snapshot(&supply.total_minted),
                    token,
                },
            );
            option::some(aggregator_v2::snapshot(&supply.total_minted))
        } else if (exists<FixedSupply>(collection_addr)) {
            let supply = borrow_global_mut<FixedSupply>(collection_addr);
            supply.current_supply = supply.current_supply + 1;
            supply.total_minted = supply.total_minted + 1;
            assert!(
                supply.current_supply <= supply.max_supply,
                error::out_of_range(ECOLLECTION_SUPPLY_EXCEEDED),
            );
            if (std::features::module_event_migration_enabled()) {
                event::emit(
                    Mint {
                        collection: collection_addr,
                        index: aggregator_v2::create_snapshot(supply.total_minted),
                        token,
                    },
                );
            };
            event::emit_event(&mut supply.mint_events,
                MintEvent {
                    index: supply.total_minted,
                    token,
                },
            );
            option::some(aggregator_v2::create_snapshot<u64>(supply.total_minted))
        } else if (exists<UnlimitedSupply>(collection_addr)) {
            let supply = borrow_global_mut<UnlimitedSupply>(collection_addr);
            supply.current_supply = supply.current_supply + 1;
            supply.total_minted = supply.total_minted + 1;
            if (std::features::module_event_migration_enabled()) {
                event::emit(
                    Mint {
                        collection: collection_addr,
                        index: aggregator_v2::create_snapshot(supply.total_minted),
                        token,
                    },
                );
            };
            event::emit_event(
                &mut supply.mint_events,
                MintEvent {
                    index: supply.total_minted,
                    token,
                },
            );
            option::some(aggregator_v2::create_snapshot<u64>(supply.total_minted))
        } else {
            option::none()
        }
    }

    /// Called by token on burn to decrement supply if there's an appropriate Supply struct.
    public(friend) fun decrement_supply(
        collection: &Object<Collection>,
        token: address,
        index: Option<u64>,
        previous_owner: address,
    ) acquires FixedSupply, UnlimitedSupply, ConcurrentSupply {
        let collection_addr = object::object_address(collection);
        if (exists<ConcurrentSupply>(collection_addr)) {
            let supply = borrow_global_mut<ConcurrentSupply>(collection_addr);
            aggregator_v2::sub(&mut supply.current_supply, 1);

            event::emit(
                Burn {
                    collection: collection_addr,
                    index: *option::borrow(&index),
                    token,
                    previous_owner,
                },
            );
        } else if (exists<FixedSupply>(collection_addr)) {
            let supply = borrow_global_mut<FixedSupply>(collection_addr);
            supply.current_supply = supply.current_supply - 1;
            if (std::features::module_event_migration_enabled()) {
                event::emit(
                    Burn {
                        collection: collection_addr,
                        index: *option::borrow(&index),
                        token,
                        previous_owner,
                    },
                );
            };
            event::emit_event(
                &mut supply.burn_events,
                BurnEvent {
                    index: *option::borrow(&index),
                    token,
                },
            );
        } else if (exists<UnlimitedSupply>(collection_addr)) {
            let supply = borrow_global_mut<UnlimitedSupply>(collection_addr);
            supply.current_supply = supply.current_supply - 1;
            if (std::features::module_event_migration_enabled()) {
                event::emit(
                    Burn {
                        collection: collection_addr,
                        index: *option::borrow(&index),
                        token,
                        previous_owner,
                    },
                );
            };
            event::emit_event(
                &mut supply.burn_events,
                BurnEvent {
                    index: *option::borrow(&index),
                    token,
                },
            );
        }
    }

    /// Creates a MutatorRef, which gates the ability to mutate any fields that support mutation.
    public fun generate_mutator_ref(ref: &ConstructorRef): MutatorRef {
        let object = object::object_from_constructor_ref<Collection>(ref);
        MutatorRef { self: object::object_address(&object) }
    }

    public fun upgrade_to_concurrent(
        ref: &ExtendRef,
    ) acquires FixedSupply, UnlimitedSupply {
        let metadata_object_address = object::address_from_extend_ref(ref);
        let metadata_object_signer = object::generate_signer_for_extending(ref);
        assert!(features::concurrent_token_v2_enabled(), error::invalid_argument(ECONCURRENT_NOT_ENABLED));

        let (supply, current_supply, total_minted, burn_events, mint_events) = if (exists<FixedSupply>(
            metadata_object_address
        )) {
            let FixedSupply {
                current_supply,
                max_supply,
                total_minted,
                burn_events,
                mint_events,
            } = move_from<FixedSupply>(metadata_object_address);

            let supply = ConcurrentSupply {
                current_supply: aggregator_v2::create_aggregator(max_supply),
                total_minted: aggregator_v2::create_unbounded_aggregator(),
            };
            (supply, current_supply, total_minted, burn_events, mint_events)
        } else if (exists<UnlimitedSupply>(metadata_object_address)) {
            let UnlimitedSupply {
                current_supply,
                total_minted,
                burn_events,
                mint_events,
            } = move_from<UnlimitedSupply>(metadata_object_address);

            let supply = ConcurrentSupply {
                current_supply: aggregator_v2::create_unbounded_aggregator(),
                total_minted: aggregator_v2::create_unbounded_aggregator(),
            };
            (supply, current_supply, total_minted, burn_events, mint_events)
        } else {
            // untracked collection is already concurrent, and other variants too.
            abort error::invalid_argument(EALREADY_CONCURRENT)
        };

        // update current state:
        aggregator_v2::add(&mut supply.current_supply, current_supply);
        aggregator_v2::add(&mut supply.total_minted, total_minted);
        move_to(&metadata_object_signer, supply);

        event::destroy_handle(burn_events);
        event::destroy_handle(mint_events);
    }

    // Accessors

    inline fun check_collection_exists(addr: address) {
        assert!(
            exists<Collection>(addr),
            error::not_found(ECOLLECTION_DOES_NOT_EXIST),
        );
    }

    inline fun borrow<T: key>(collection: &Object<T>): &Collection {
        let collection_address = object::object_address(collection);
        check_collection_exists(collection_address);
        borrow_global<Collection>(collection_address)
    }

    #[view]
    /// Provides the count of the current selection if supply tracking is used
    ///
    /// Note: Calling this method from transaction that also mints/burns, prevents
    /// it from being parallelized.
    public fun count<T: key>(
        collection: Object<T>
    ): Option<u64> acquires FixedSupply, UnlimitedSupply, ConcurrentSupply {
        let collection_address = object::object_address(&collection);
        check_collection_exists(collection_address);

        if (exists<ConcurrentSupply>(collection_address)) {
            let supply = borrow_global_mut<ConcurrentSupply>(collection_address);
            option::some(aggregator_v2::read(&supply.current_supply))
        } else if (exists<FixedSupply>(collection_address)) {
            let supply = borrow_global_mut<FixedSupply>(collection_address);
            option::some(supply.current_supply)
        } else if (exists<UnlimitedSupply>(collection_address)) {
            let supply = borrow_global_mut<UnlimitedSupply>(collection_address);
            option::some(supply.current_supply)
        } else {
            option::none()
        }
    }

    #[view]
    public fun creator<T: key>(collection: Object<T>): address acquires Collection {
        borrow(&collection).creator
    }

    #[view]
    public fun description<T: key>(collection: Object<T>): String acquires Collection {
        borrow(&collection).description
    }

    #[view]
    public fun name<T: key>(collection: Object<T>): String acquires Collection {
        borrow(&collection).name
    }

    #[view]
    public fun uri<T: key>(collection: Object<T>): String acquires Collection {
        borrow(&collection).uri
    }

    // Mutators

    inline fun borrow_mut(mutator_ref: &MutatorRef): &mut Collection {
        check_collection_exists(mutator_ref.self);
        borrow_global_mut<Collection>(mutator_ref.self)
    }

    /// Callers of this function must be aware that changing the name will change the calculated
    /// collection's address when calling \`create_collection_address\`.
    /// Once the collection has been created, the collection address should be saved for reference and
    /// \`create_collection_address\` should not be used to derive the collection's address.
    ///
    /// After changing the collection's name, to create tokens - only call functions that accept the collection object as an argument.
    public fun set_name(mutator_ref: &MutatorRef, name: String) acquires Collection {
        assert!(string::length(&name) <= MAX_COLLECTION_NAME_LENGTH, error::out_of_range(ECOLLECTION_NAME_TOO_LONG));
        let collection = borrow_mut(mutator_ref);
        event::emit(Mutation {
            mutated_field_name: string::utf8(b"name") ,
            collection: object::address_to_object(mutator_ref.self),
            old_value: collection.name,
            new_value: name,
        });
        collection.name = name;
    }

    public fun set_description(mutator_ref: &MutatorRef, description: String) acquires Collection {
        assert!(string::length(&description) <= MAX_DESCRIPTION_LENGTH, error::out_of_range(EDESCRIPTION_TOO_LONG));
        let collection = borrow_mut(mutator_ref);
        if (std::features::module_event_migration_enabled()) {
            event::emit(Mutation {
                mutated_field_name: string::utf8(b"description"),
                collection: object::address_to_object(mutator_ref.self),
                old_value: collection.description,
                new_value: description,
            });
        };
        collection.description = description;
        event::emit_event(
            &mut collection.mutation_events,
            MutationEvent { mutated_field_name: string::utf8(b"description") },
        );
    }

    public fun set_uri(mutator_ref: &MutatorRef, uri: String) acquires Collection {
        assert!(string::length(&uri) <= MAX_URI_LENGTH, error::out_of_range(EURI_TOO_LONG));
        let collection = borrow_mut(mutator_ref);
        if (std::features::module_event_migration_enabled()) {
            event::emit(Mutation {
                mutated_field_name: string::utf8(b"uri"),
                collection: object::address_to_object(mutator_ref.self),
                old_value: collection.uri,
                new_value: uri,
            });
        };
        collection.uri = uri;
        event::emit_event(
            &mut collection.mutation_events,
            MutationEvent { mutated_field_name: string::utf8(b"uri") },
        );
    }

    public fun set_max_supply(mutator_ref: &MutatorRef, max_supply: u64) acquires ConcurrentSupply, FixedSupply {
        let collection = object::address_to_object<Collection>(mutator_ref.self);
        let collection_address = object::object_address(&collection);
        let old_max_supply;

        if (exists<ConcurrentSupply>(collection_address)) {
            let supply = borrow_global_mut<ConcurrentSupply>(collection_address);
            let current_supply = aggregator_v2::read(&supply.current_supply);
            assert!(
                max_supply >= current_supply,
                error::out_of_range(EINVALID_MAX_SUPPLY),
            );
            old_max_supply = aggregator_v2::max_value(&supply.current_supply);
            supply.current_supply = aggregator_v2::create_aggregator(max_supply);
            aggregator_v2::add(&mut supply.current_supply, current_supply);
        } else if (exists<FixedSupply>(collection_address)) {
            let supply = borrow_global_mut<FixedSupply>(collection_address);
            assert!(
                max_supply >= supply.current_supply,
                error::out_of_range(EINVALID_MAX_SUPPLY),
            );
            old_max_supply = supply.max_supply;
            supply.max_supply = max_supply;
        } else {
            abort error::invalid_argument(ENO_MAX_SUPPLY_IN_COLLECTION)
        };

        event::emit(SetMaxSupply { collection, old_max_supply, new_max_supply: max_supply });
    }

    // Tests

    #[test(fx = @aptos_framework, creator = @0x123)]
    fun test_create_mint_burn_for_unlimited(fx: &signer, creator: &signer) acquires FixedSupply, UnlimitedSupply, ConcurrentSupply {
        let feature = features::get_concurrent_token_v2_feature();
        features::change_feature_flags_for_testing(fx, vector[], vector[feature]);

        let creator_address = signer::address_of(creator);
        let name = string::utf8(b"collection name");
        create_unlimited_collection(creator, string::utf8(b""), name, option::none(), string::utf8(b""));
        let collection_address = create_collection_address(&creator_address, &name);
        let collection = object::address_to_object<Collection>(collection_address);
        assert!(count(collection) == option::some(0), 0);
        let cid = aggregator_v2::read_snapshot(&option::destroy_some(increment_concurrent_supply(&collection, creator_address)));
        assert!(count(collection) == option::some(1), 0);
        assert!(event::counter(&borrow_global<UnlimitedSupply>(collection_address).mint_events) == 1, 0);
        decrement_supply(&collection, creator_address, option::some(cid), creator_address);
        assert!(count(collection) == option::some(0), 0);
        assert!(event::counter(&borrow_global<UnlimitedSupply>(collection_address).burn_events) == 1, 0);
    }

    #[test(fx = @aptos_framework, creator = @0x123)]
    fun test_create_mint_burn_for_fixed(fx: &signer, creator: &signer) acquires FixedSupply, UnlimitedSupply, ConcurrentSupply {
        let feature = features::get_concurrent_token_v2_feature();
        features::change_feature_flags_for_testing(fx, vector[], vector[feature]);

        let creator_address = signer::address_of(creator);
        let name = string::utf8(b"collection name");
        create_fixed_collection(creator, string::utf8(b""), 1, name, option::none(), string::utf8(b""));
        let collection_address = create_collection_address(&creator_address, &name);
        let collection = object::address_to_object<Collection>(collection_address);
        assert!(count(collection) == option::some(0), 0);
        let cid = aggregator_v2::read_snapshot(&option::destroy_some(increment_concurrent_supply(&collection, creator_address)));
        assert!(count(collection) == option::some(1), 0);
        assert!(event::counter(&borrow_global<FixedSupply>(collection_address).mint_events) == 1, 0);
        decrement_supply(&collection, creator_address, option::some(cid), creator_address);
        assert!(count(collection) == option::some(0), 0);
        assert!(event::counter(&borrow_global<FixedSupply>(collection_address).burn_events) == 1, 0);
    }

    #[test(fx = @aptos_framework, creator = @0x123)]
    fun test_create_mint_burn_for_concurrent(
        fx: &signer,
        creator: &signer
    ) acquires FixedSupply, UnlimitedSupply, ConcurrentSupply {
        let feature = features::get_concurrent_token_v2_feature();
        features::change_feature_flags_for_testing(fx, vector[feature], vector[]);

        let creator_address = signer::address_of(creator);
        let name = string::utf8(b"collection name");
        create_fixed_collection(creator, string::utf8(b""), 1, name, option::none(), string::utf8(b""));
        let collection_address = create_collection_address(&creator_address, &name);
        let collection = object::address_to_object<Collection>(collection_address);
        assert!(count(collection) == option::some(0), 0);
        let cid = increment_concurrent_supply(&collection, creator_address);
        event::was_event_emitted<Mint>(&Mint {
            collection: collection_address,
            index: aggregator_v2::create_snapshot(0),
            token: creator_address,
        });
        assert!(cid == option::some(aggregator_v2::create_snapshot(1)), 1);
        assert!(count(collection) == option::some(1), 0);
        decrement_supply(&collection, creator_address, option::some(1), creator_address);
        event::was_event_emitted<Burn>(&Burn {
            collection: collection_address,
            index: 1,
            token: creator_address,
            previous_owner: creator_address,
        });
        assert!(count(collection) == option::some(0), 0);
    }

    #[test(creator = @0x123, trader = @0x456)]
    #[expected_failure(abort_code = 0x50003, location = aptos_framework::object)]
    entry fun test_create_and_transfer(creator: &signer, trader: &signer) {
        let creator_address = signer::address_of(creator);
        let collection_name = string::utf8(b"collection name");
        create_collection_helper(creator, collection_name);

        let collection = object::address_to_object<Collection>(
            create_collection_address(&creator_address, &collection_name),
        );
        assert!(object::owner(collection) == creator_address, 1);
        object::transfer(creator, collection, signer::address_of(trader));
    }

    #[test(creator = @0x123)]
    #[expected_failure(abort_code = 0x80001, location = aptos_framework::object)]
    entry fun test_duplicate_collection(creator: &signer) {
        let collection_name = string::utf8(b"collection name");
        create_collection_helper(creator, collection_name);
        create_collection_helper(creator, collection_name);
    }

    #[test(creator = @0x123)]
    entry fun test_set_name(creator: &signer) acquires Collection {
        let collection_name = string::utf8(b"collection name");
        let constructor_ref = create_collection_helper(creator, collection_name);
        let mutator_ref = generate_mutator_ref(&constructor_ref);
        let collection = object::address_to_object<Collection>(
            create_collection_address(&signer::address_of(creator), &collection_name),
        );
        let new_collection_name = string::utf8(b"new collection name");
        assert!(new_collection_name != name(collection), 0);
        set_name(&mutator_ref, new_collection_name);
        assert!(new_collection_name == name(collection), 1);
        event::was_event_emitted(&Mutation {
            mutated_field_name: string::utf8(b"name"),
            collection,
            old_value: collection_name,
            new_value: new_collection_name,
        });
    }

    #[test(creator = @0x123)]
    entry fun test_set_description(creator: &signer) acquires Collection {
        let collection_name = string::utf8(b"collection name");
        let constructor_ref = create_collection_helper(creator, collection_name);
        let collection = object::address_to_object<Collection>(
            create_collection_address(&signer::address_of(creator), &collection_name),
        );
        let mutator_ref = generate_mutator_ref(&constructor_ref);
        let description = string::utf8(b"no fail");
        assert!(description != description(collection), 0);
        set_description(&mutator_ref, description);
        assert!(description == description(collection), 1);
    }

    #[test(creator = @0x123)]
    entry fun test_set_uri(creator: &signer) acquires Collection {
        let collection_name = string::utf8(b"collection name");
        let constructor_ref = create_collection_helper(creator, collection_name);
        let mutator_ref = generate_mutator_ref(&constructor_ref);
        let collection = object::address_to_object<Collection>(
            create_collection_address(&signer::address_of(creator), &collection_name),
        );
        let uri = string::utf8(b"no fail");
        assert!(uri != uri(collection), 0);
        set_uri(&mutator_ref, uri);
        assert!(uri == uri(collection), 1);
    }

    #[test(fx = @aptos_framework, creator = @0x123)]
    entry fun test_set_max_supply_concurrent(creator: &signer, fx: &signer) acquires ConcurrentSupply, FixedSupply {
        let feature = features::get_concurrent_token_v2_feature();
        features::change_feature_flags_for_testing(fx, vector[feature], vector[]);

        let collection_name = string::utf8(b"collection name");
        let max_supply = 100;
        let constructor_ref = create_fixed_collection_helper(creator, collection_name, max_supply);
        let mutator_ref = generate_mutator_ref(&constructor_ref);

        let new_max_supply = 200;
        set_max_supply(&mutator_ref, new_max_supply);

        let collection_address = create_collection_address(&signer::address_of(creator), &collection_name);
        let supply = borrow_global<ConcurrentSupply>(collection_address);
        assert!(aggregator_v2::max_value(&supply.current_supply) == new_max_supply, 0);

        event::was_event_emitted<SetMaxSupply>(&SetMaxSupply {
            collection: object::address_to_object<Collection>(collection_address),
            old_max_supply: max_supply,
            new_max_supply,
        });
    }

    #[test(fx = @aptos_framework, creator = @0x123)]
    entry fun test_set_max_supply_same_as_current_supply_fixed(
        creator: &signer,
        fx: &signer,
    ) acquires ConcurrentSupply, FixedSupply, UnlimitedSupply {
        let feature = features::get_concurrent_token_v2_feature();
        features::change_feature_flags_for_testing(fx, vector[], vector[feature]);

        let collection_name = string::utf8(b"collection name");
        let max_supply = 10;
        let constructor_ref = create_fixed_collection_helper(creator, collection_name, max_supply);
        let collection = object::object_from_constructor_ref<Collection>(&constructor_ref);
        let token_signer = create_token(creator);

        let current_supply = 5;
        let i = 0;
        while (i < current_supply) {
            increment_supply(&collection, signer::address_of(&token_signer));
            i = i + 1;
        };

        let mutator_ref = generate_mutator_ref(&constructor_ref);
        set_max_supply(&mutator_ref, current_supply);

        let collection_address = create_collection_address(&signer::address_of(creator), &collection_name);
        let supply = borrow_global<FixedSupply>(collection_address);
        assert!(supply.max_supply == current_supply, EINVALID_MAX_SUPPLY);

        event::was_event_emitted<SetMaxSupply>(&SetMaxSupply {
            collection: object::address_to_object<Collection>(collection_address),
            old_max_supply: current_supply,
            new_max_supply: current_supply,
        });
    }

    #[test(creator = @0x123)]
    #[expected_failure(abort_code = 0x1000A, location = aptos_token_objects::collection)]
    entry fun test_set_max_supply_none(creator: &signer) acquires ConcurrentSupply, FixedSupply {
        let collection_name = string::utf8(b"collection name");
        let constructor_ref = create_collection_helper(creator, collection_name);
        let mutator_ref = generate_mutator_ref(&constructor_ref);
        set_max_supply(&mutator_ref, 200);
    }

    #[test(fx = @aptos_framework, creator = @0x123)]
    #[expected_failure(abort_code = 0x20009, location = aptos_token_objects::collection)]
    entry fun test_set_max_supply_too_low_fixed_supply(creator: &signer, fx: &signer) acquires ConcurrentSupply, FixedSupply, UnlimitedSupply {
        let feature = features::get_concurrent_token_v2_feature();
        features::change_feature_flags_for_testing(fx, vector[], vector[feature]);

        let max_supply = 3;
        let collection_name = string::utf8(b"Low Supply Collection");
        let constructor_ref = create_fixed_collection_helper(creator, collection_name, max_supply);
        let collection = object::object_from_constructor_ref<Collection>(&constructor_ref);
        let token_signer = create_token(creator);

        let i = 0;
        while (i < max_supply) {
            increment_supply(&collection, signer::address_of(&token_signer));
            i = i + 1;
        };

        let mutator_ref = generate_mutator_ref(&constructor_ref);
        let new_max_supply = 2;
        set_max_supply(&mutator_ref, new_max_supply);
    }

    #[test(fx = @aptos_framework, creator = @0x123)]
    #[expected_failure(abort_code = 0x20009, location = aptos_token_objects::collection)]
    entry fun test_set_max_supply_too_low_concurrent_supply(creator: &signer, fx: &signer) acquires ConcurrentSupply, FixedSupply, UnlimitedSupply {
        let concurrent_feature = features::get_concurrent_token_v2_feature();
        let aggregator_feature = features::get_aggregator_v2_api_feature();
        features::change_feature_flags_for_testing(fx, vector[concurrent_feature, aggregator_feature], vector[]);

        let collection_name = string::utf8(b"Low Supply Collection");
        let max_supply = 3;
        let constructor_ref = create_fixed_collection_helper(creator, collection_name, max_supply);
        let collection = object::object_from_constructor_ref<Collection>(&constructor_ref);
        let token_signer = create_token(creator);

        let i = 0;
        while (i < max_supply) {
            increment_concurrent_supply(&collection, signer::address_of(&token_signer));
            i = i + 1;
        };

        let mutator_ref = generate_mutator_ref(&constructor_ref);
        let new_max_supply = 2;
        set_max_supply(&mutator_ref, new_max_supply);
    }

    #[test_only]
    fun create_collection_helper(creator: &signer, name: String): ConstructorRef {
        create_untracked_collection(
            creator,
            string::utf8(b"collection description"),
            name,
            option::none(),
            string::utf8(b"collection uri"),
        )
    }

    #[test_only]
    fun create_fixed_collection_helper(creator: &signer, name: String, max_supply: u64): ConstructorRef {
        create_fixed_collection(
            creator,
            string::utf8(b"description"),
            max_supply,
            name,
            option::none(),
            string::utf8(b"uri"),
        )
    }

    #[test_only]
    /// Create a token as we cannot create a dependency cycle between collection and token modules.
    fun create_token(creator: &signer): signer {
        let token_constructor_ref = &object::create_object(signer::address_of(creator));
        object::generate_signer(token_constructor_ref)
    }
}
`, "name": "collection.move" }, { "content": '/// `PropertyMap` provides generic metadata support for `AptosToken`. It is a specialization of\n/// `SimpleMap` that enforces strict typing with minimal storage use by using constant u64 to\n/// represent types and storing values in bcs format.\nmodule aptos_token_objects::property_map {\n    use std::bcs;\n    use std::vector;\n    use std::error;\n    use std::string::{Self, String};\n    use aptos_std::from_bcs;\n    use aptos_std::simple_map::{Self, SimpleMap};\n    use aptos_std::type_info;\n    use aptos_framework::object::{Self, ConstructorRef, Object, ExtendRef, ObjectCore};\n\n    // Errors\n    /// The property map does not exist\n    const EPROPERTY_MAP_DOES_NOT_EXIST: u64 = 1;\n    /// The property key already exists\n    const EKEY_ALREADY_EXISTS_IN_PROPERTY_MAP: u64 = 2;\n    /// The number of properties exceeds the maximum\n    const ETOO_MANY_PROPERTIES: u64 = 3;\n    /// Property key and value counts do not match\n    const EKEY_VALUE_COUNT_MISMATCH: u64 = 4;\n    /// Property key and type counts do not match\n    const EKEY_TYPE_COUNT_MISMATCH: u64 = 5;\n    /// Property value does not match expected type\n    const ETYPE_MISMATCH: u64 = 6;\n    /// Invalid value type specified\n    const ETYPE_INVALID: u64 = 7;\n    /// The key of the property is too long\n    const EPROPERTY_MAP_KEY_TOO_LONG: u64 = 8;\n\n    // Constants\n    /// Maximum number of items in a `PropertyMap`\n    const MAX_PROPERTY_MAP_SIZE: u64 = 1000;\n    /// Maximum number of characters in a property name\n    const MAX_PROPERTY_NAME_LENGTH: u64 = 128;\n\n    // PropertyValue::type\n    const BOOL: u8 = 0;\n    const U8: u8 = 1;\n    const U16: u8 = 2;\n    const U32: u8 = 3;\n    const U64: u8 = 4;\n    const U128: u8 = 5;\n    const U256: u8 = 6;\n    const ADDRESS: u8 = 7;\n    const BYTE_VECTOR: u8 = 8;\n    const STRING: u8 = 9;\n\n    // Structs\n    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]\n    /// A Map for typed key to value mapping, the contract using it\n    /// should keep track of what keys are what types, and parse them accordingly.\n    struct PropertyMap has drop, key {\n        inner: SimpleMap<String, PropertyValue>,\n    }\n\n    /// A typed value for the `PropertyMap` to ensure that typing is always consistent\n    struct PropertyValue has drop, store {\n        type: u8,\n        value: vector<u8>,\n    }\n\n    /// A mutator ref that allows for mutation of the property map\n    struct MutatorRef has drop, store {\n        self: address,\n    }\n\n    public fun init(ref: &ConstructorRef, container: PropertyMap) {\n        let signer = object::generate_signer(ref);\n        move_to(&signer, container);\n    }\n\n    public fun extend(ref: &ExtendRef, container: PropertyMap) {\n        let signer = object::generate_signer_for_extending(ref);\n        move_to(&signer, container);\n    }\n\n    /// Burns the entire property map\n    public fun burn(ref: MutatorRef) acquires PropertyMap {\n        move_from<PropertyMap>(ref.self);\n    }\n\n    /// Helper for external entry functions to produce a valid container for property values.\n    public fun prepare_input(\n        keys: vector<String>,\n        types: vector<String>,\n        values: vector<vector<u8>>,\n    ): PropertyMap {\n        let length = vector::length(&keys);\n        assert!(length <= MAX_PROPERTY_MAP_SIZE, error::invalid_argument(ETOO_MANY_PROPERTIES));\n        assert!(length == vector::length(&values), error::invalid_argument(EKEY_VALUE_COUNT_MISMATCH));\n        assert!(length == vector::length(&types), error::invalid_argument(EKEY_TYPE_COUNT_MISMATCH));\n\n        let container = simple_map::create<String, PropertyValue>();\n        while (!vector::is_empty(&keys)) {\n            let key = vector::pop_back(&mut keys);\n            assert!(\n                string::length(&key) <= MAX_PROPERTY_NAME_LENGTH,\n                error::invalid_argument(EPROPERTY_MAP_KEY_TOO_LONG),\n            );\n\n            let value = vector::pop_back(&mut values);\n            let type = vector::pop_back(&mut types);\n\n            let new_type = to_internal_type(type);\n            validate_type(new_type, value);\n\n            simple_map::add(&mut container, key, PropertyValue { value, type: new_type });\n        };\n\n        PropertyMap { inner: container }\n    }\n\n    /// Maps `String` representation of types from their `u8` representation\n    inline fun to_external_type(type: u8): String {\n        if (type == BOOL) {\n            string::utf8(b"bool")\n        } else if (type == U8) {\n            string::utf8(b"u8")\n        } else if (type == U16) {\n            string::utf8(b"u16")\n        } else if (type == U32) {\n            string::utf8(b"u32")\n        } else if (type == U64) {\n            string::utf8(b"u64")\n        } else if (type == U128) {\n            string::utf8(b"u128")\n        } else if (type == U256) {\n            string::utf8(b"u256")\n        } else if (type == ADDRESS) {\n            string::utf8(b"address")\n        } else if (type == BYTE_VECTOR) {\n            string::utf8(b"vector<u8>")\n        } else if (type == STRING) {\n            string::utf8(b"0x1::string::String")\n        } else {\n            abort (error::invalid_argument(ETYPE_INVALID))\n        }\n    }\n\n    /// Maps the `String` representation of types to `u8`\n    inline fun to_internal_type(type: String): u8 {\n        if (type == string::utf8(b"bool")) {\n            BOOL\n        } else if (type == string::utf8(b"u8")) {\n            U8\n        } else if (type == string::utf8(b"u16")) {\n            U16\n        } else if (type == string::utf8(b"u32")) {\n            U32\n        } else if (type == string::utf8(b"u64")) {\n            U64\n        } else if (type == string::utf8(b"u128")) {\n            U128\n        } else if (type == string::utf8(b"u256")) {\n            U256\n        } else if (type == string::utf8(b"address")) {\n            ADDRESS\n        } else if (type == string::utf8(b"vector<u8>")) {\n            BYTE_VECTOR\n        } else if (type == string::utf8(b"0x1::string::String")) {\n            STRING\n        } else {\n            abort (error::invalid_argument(ETYPE_INVALID))\n        }\n    }\n\n    /// Maps Move type to `u8` representation\n    inline fun type_info_to_internal_type<T>(): u8 {\n        let type = type_info::type_name<T>();\n        to_internal_type(type)\n    }\n\n    /// Validates property value type against its expected type\n    inline fun validate_type(type: u8, value: vector<u8>) {\n        if (type == BOOL) {\n            from_bcs::to_bool(value);\n        } else if (type == U8) {\n            from_bcs::to_u8(value);\n        } else if (type == U16) {\n            from_bcs::to_u16(value);\n        } else if (type == U32) {\n            from_bcs::to_u32(value);\n        } else if (type == U64) {\n            from_bcs::to_u64(value);\n        } else if (type == U128) {\n            from_bcs::to_u128(value);\n        } else if (type == U256) {\n            from_bcs::to_u256(value);\n        } else if (type == ADDRESS) {\n            from_bcs::to_address(value);\n        } else if (type == BYTE_VECTOR) {\n            // nothing to validate...\n        } else if (type == STRING) {\n            from_bcs::to_string(value);\n        } else {\n            abort (error::invalid_argument(ETYPE_MISMATCH))\n        };\n    }\n\n    public fun generate_mutator_ref(ref: &ConstructorRef): MutatorRef {\n        MutatorRef { self: object::address_from_constructor_ref(ref) }\n    }\n\n    // Accessors\n\n    public fun contains_key<T: key>(object: &Object<T>, key: &String): bool acquires PropertyMap {\n        assert_exists(object::object_address(object));\n        let property_map = borrow_global<PropertyMap>(object::object_address(object));\n        simple_map::contains_key(&property_map.inner, key)\n    }\n\n    public fun length<T: key>(object: &Object<T>): u64 acquires PropertyMap {\n        assert_exists(object::object_address(object));\n        let property_map = borrow_global<PropertyMap>(object::object_address(object));\n        simple_map::length(&property_map.inner)\n    }\n\n    /// Read the property and get it\'s external type in it\'s bcs encoded format\n    ///\n    /// The preferred method is to use `read_<type>` where the type is already known.\n    public fun read<T: key>(object: &Object<T>, key: &String): (String, vector<u8>) acquires PropertyMap {\n        assert_exists(object::object_address(object));\n        let property_map = borrow_global<PropertyMap>(object::object_address(object));\n        let property_value = simple_map::borrow(&property_map.inner, key);\n        let new_type = to_external_type(property_value.type);\n        (new_type, property_value.value)\n    }\n\n    inline fun assert_exists(object: address) {\n        assert!(\n            exists<PropertyMap>(object),\n            error::not_found(EPROPERTY_MAP_DOES_NOT_EXIST),\n        );\n    }\n\n    /// Read a type and verify that the type is correct\n    inline fun read_typed<T: key, V>(object: &Object<T>, key: &String): vector<u8> acquires PropertyMap {\n        let (type, value) = read(object, key);\n        assert!(\n            type == type_info::type_name<V>(),\n            error::invalid_argument(ETYPE_MISMATCH),\n        );\n        value\n    }\n\n    public fun read_bool<T: key>(object: &Object<T>, key: &String): bool acquires PropertyMap {\n        let value = read_typed<T, bool>(object, key);\n        from_bcs::to_bool(value)\n    }\n\n    public fun read_u8<T: key>(object: &Object<T>, key: &String): u8 acquires PropertyMap {\n        let value = read_typed<T, u8>(object, key);\n        from_bcs::to_u8(value)\n    }\n\n    public fun read_u16<T: key>(object: &Object<T>, key: &String): u16 acquires PropertyMap {\n        let value = read_typed<T, u16>(object, key);\n        from_bcs::to_u16(value)\n    }\n\n    public fun read_u32<T: key>(object: &Object<T>, key: &String): u32 acquires PropertyMap {\n        let value = read_typed<T, u32>(object, key);\n        from_bcs::to_u32(value)\n    }\n\n    public fun read_u64<T: key>(object: &Object<T>, key: &String): u64 acquires PropertyMap {\n        let value = read_typed<T, u64>(object, key);\n        from_bcs::to_u64(value)\n    }\n\n    public fun read_u128<T: key>(object: &Object<T>, key: &String): u128 acquires PropertyMap {\n        let value = read_typed<T, u128>(object, key);\n        from_bcs::to_u128(value)\n    }\n\n    public fun read_u256<T: key>(object: &Object<T>, key: &String): u256 acquires PropertyMap {\n        let value = read_typed<T, u256>(object, key);\n        from_bcs::to_u256(value)\n    }\n\n    public fun read_address<T: key>(object: &Object<T>, key: &String): address acquires PropertyMap {\n        let value = read_typed<T, address>(object, key);\n        from_bcs::to_address(value)\n    }\n\n    public fun read_bytes<T: key>(object: &Object<T>, key: &String): vector<u8> acquires PropertyMap {\n        let value = read_typed<T, vector<u8>>(object, key);\n        from_bcs::to_bytes(value)\n    }\n\n    public fun read_string<T: key>(object: &Object<T>, key: &String): String acquires PropertyMap {\n        let value = read_typed<T, String>(object, key);\n        from_bcs::to_string(value)\n    }\n\n    // Mutators\n    /// Add a property, already bcs encoded as a `vector<u8>`\n    public fun add(ref: &MutatorRef, key: String, type: String, value: vector<u8>) acquires PropertyMap {\n        let new_type = to_internal_type(type);\n        validate_type(new_type, value);\n        add_internal(ref, key, new_type, value);\n    }\n\n    /// Add a property that isn\'t already encoded as a `vector<u8>`\n    public fun add_typed<T: drop>(ref: &MutatorRef, key: String, value: T) acquires PropertyMap {\n        let type = type_info_to_internal_type<T>();\n        add_internal(ref, key, type, bcs::to_bytes(&value));\n    }\n\n    inline fun add_internal(ref: &MutatorRef, key: String, type: u8, value: vector<u8>) acquires PropertyMap {\n        assert_exists(ref.self);\n        let property_map = borrow_global_mut<PropertyMap>(ref.self);\n        simple_map::add(&mut property_map.inner, key, PropertyValue { type, value });\n    }\n\n    /// Updates a property in place already bcs encoded\n    public fun update(ref: &MutatorRef, key: &String, type: String, value: vector<u8>) acquires PropertyMap {\n        let new_type = to_internal_type(type);\n        validate_type(new_type, value);\n        update_internal(ref, key, new_type, value);\n    }\n\n    /// Updates a property in place that is not already bcs encoded\n    public fun update_typed<T: drop>(ref: &MutatorRef, key: &String, value: T) acquires PropertyMap {\n        let type = type_info_to_internal_type<T>();\n        update_internal(ref, key, type, bcs::to_bytes(&value));\n    }\n\n    inline fun update_internal(ref: &MutatorRef, key: &String, type: u8, value: vector<u8>) acquires PropertyMap {\n        assert_exists(ref.self);\n        let property_map = borrow_global_mut<PropertyMap>(ref.self);\n        let old_value = simple_map::borrow_mut(&mut property_map.inner, key);\n        *old_value = PropertyValue { type, value };\n    }\n\n    /// Removes a property from the map, ensuring that it does in fact exist\n    public fun remove(ref: &MutatorRef, key: &String) acquires PropertyMap {\n        assert_exists(ref.self);\n        let property_map = borrow_global_mut<PropertyMap>(ref.self);\n        simple_map::remove(&mut property_map.inner, key);\n    }\n\n    // Tests\n    #[test(creator = @0x123)]\n    fun test_end_to_end(creator: &signer) acquires PropertyMap {\n        let constructor_ref = object::create_named_object(creator, b"");\n        let object = object::object_from_constructor_ref<object::ObjectCore>(&constructor_ref);\n\n        let input = end_to_end_input();\n        init(&constructor_ref, input);\n        let mutator = generate_mutator_ref(&constructor_ref);\n\n        assert_end_to_end_input(object);\n\n        test_end_to_end_update_typed(&mutator, &object);\n\n        assert!(length(&object) == 9, 19);\n\n        remove(&mutator, &string::utf8(b"bool"));\n        remove(&mutator, &string::utf8(b"u8"));\n        remove(&mutator, &string::utf8(b"u16"));\n        remove(&mutator, &string::utf8(b"u32"));\n        remove(&mutator, &string::utf8(b"u64"));\n        remove(&mutator, &string::utf8(b"u128"));\n        remove(&mutator, &string::utf8(b"u256"));\n        remove(&mutator, &string::utf8(b"vector<u8>"));\n        remove(&mutator, &string::utf8(b"0x1::string::String"));\n\n        assert!(length(&object) == 0, 20);\n\n        test_end_to_end_add_typed(&mutator, &object);\n\n        assert!(length(&object) == 9, 30);\n\n        remove(&mutator, &string::utf8(b"bool"));\n        remove(&mutator, &string::utf8(b"u8"));\n        remove(&mutator, &string::utf8(b"u16"));\n        remove(&mutator, &string::utf8(b"u32"));\n        remove(&mutator, &string::utf8(b"u64"));\n        remove(&mutator, &string::utf8(b"u128"));\n        remove(&mutator, &string::utf8(b"u256"));\n        remove(&mutator, &string::utf8(b"vector<u8>"));\n        remove(&mutator, &string::utf8(b"0x1::string::String"));\n\n        assert!(length(&object) == 0, 31);\n\n        add(&mutator, string::utf8(b"bool"), string::utf8(b"bool"), bcs::to_bytes<bool>(&true));\n        add(&mutator, string::utf8(b"u8"), string::utf8(b"u8"), bcs::to_bytes<u8>(&0x12));\n        add(&mutator, string::utf8(b"u16"), string::utf8(b"u16"), bcs::to_bytes<u16>(&0x1234));\n        add(&mutator, string::utf8(b"u32"), string::utf8(b"u32"), bcs::to_bytes<u32>(&0x12345678));\n        add(&mutator, string::utf8(b"u64"), string::utf8(b"u64"), bcs::to_bytes<u64>(&0x1234567812345678));\n        add(\n            &mutator,\n            string::utf8(b"u128"),\n            string::utf8(b"u128"),\n            bcs::to_bytes<u128>(&0x12345678123456781234567812345678)\n        );\n        add(\n            &mutator,\n            string::utf8(b"u256"),\n            string::utf8(b"u256"),\n            bcs::to_bytes<u256>(&0x1234567812345678123456781234567812345678123456781234567812345678)\n        );\n        add(\n            &mutator,\n            string::utf8(b"vector<u8>"),\n            string::utf8(b"vector<u8>"),\n            bcs::to_bytes<vector<u8>>(&vector[0x01])\n        );\n        add(\n            &mutator,\n            string::utf8(b"0x1::string::String"),\n            string::utf8(b"0x1::string::String"),\n            bcs::to_bytes<String>(&string::utf8(b"a"))\n        );\n\n        assert!(read_bool(&object, &string::utf8(b"bool")), 32);\n        assert!(read_u8(&object, &string::utf8(b"u8")) == 0x12, 33);\n        assert!(read_u16(&object, &string::utf8(b"u16")) == 0x1234, 34);\n        assert!(read_u32(&object, &string::utf8(b"u32")) == 0x12345678, 35);\n        assert!(read_u64(&object, &string::utf8(b"u64")) == 0x1234567812345678, 36);\n        assert!(read_u128(&object, &string::utf8(b"u128")) == 0x12345678123456781234567812345678, 37);\n        assert!(\n            read_u256(\n                &object,\n                &string::utf8(b"u256")\n            ) == 0x1234567812345678123456781234567812345678123456781234567812345678,\n            38\n        );\n        assert!(read_bytes(&object, &string::utf8(b"vector<u8>")) == vector[0x01], 39);\n        assert!(read_string(&object, &string::utf8(b"0x1::string::String")) == string::utf8(b"a"), 40);\n\n        assert!(length(&object) == 9, 41);\n\n        update(&mutator, &string::utf8(b"bool"), string::utf8(b"bool"), bcs::to_bytes<bool>(&false));\n        update(&mutator, &string::utf8(b"u8"), string::utf8(b"u8"), bcs::to_bytes<u8>(&0x21));\n        update(&mutator, &string::utf8(b"u16"), string::utf8(b"u16"), bcs::to_bytes<u16>(&0x22));\n        update(&mutator, &string::utf8(b"u32"), string::utf8(b"u32"), bcs::to_bytes<u32>(&0x23));\n        update(&mutator, &string::utf8(b"u64"), string::utf8(b"u64"), bcs::to_bytes<u64>(&0x24));\n        update(&mutator, &string::utf8(b"u128"), string::utf8(b"u128"), bcs::to_bytes<u128>(&0x25));\n        update(&mutator, &string::utf8(b"u256"), string::utf8(b"u256"), bcs::to_bytes<u256>(&0x26));\n        update(\n            &mutator,\n            &string::utf8(b"vector<u8>"),\n            string::utf8(b"vector<u8>"),\n            bcs::to_bytes<vector<u8>>(&vector[0x02])\n        );\n        update(\n            &mutator,\n            &string::utf8(b"0x1::string::String"),\n            string::utf8(b"0x1::string::String"),\n            bcs::to_bytes<String>(&string::utf8(b"ha"))\n        );\n\n        assert!(!read_bool(&object, &string::utf8(b"bool")), 10);\n        assert!(read_u8(&object, &string::utf8(b"u8")) == 0x21, 11);\n        assert!(read_u16(&object, &string::utf8(b"u16")) == 0x22, 12);\n        assert!(read_u32(&object, &string::utf8(b"u32")) == 0x23, 13);\n        assert!(read_u64(&object, &string::utf8(b"u64")) == 0x24, 14);\n        assert!(read_u128(&object, &string::utf8(b"u128")) == 0x25, 15);\n        assert!(read_u256(&object, &string::utf8(b"u256")) == 0x26, 16);\n        assert!(read_bytes(&object, &string::utf8(b"vector<u8>")) == vector[0x02], 17);\n        assert!(read_string(&object, &string::utf8(b"0x1::string::String")) == string::utf8(b"ha"), 18);\n    }\n\n    #[test_only]\n    fun test_end_to_end_update_typed(mutator: &MutatorRef, object: &Object<object::ObjectCore>) acquires PropertyMap {\n        update_typed<bool>(mutator, &string::utf8(b"bool"), false);\n        update_typed<u8>(mutator, &string::utf8(b"u8"), 0x21);\n        update_typed<u16>(mutator, &string::utf8(b"u16"), 0x22);\n        update_typed<u32>(mutator, &string::utf8(b"u32"), 0x23);\n        update_typed<u64>(mutator, &string::utf8(b"u64"), 0x24);\n        update_typed<u128>(mutator, &string::utf8(b"u128"), 0x25);\n        update_typed<u256>(mutator, &string::utf8(b"u256"), 0x26);\n        update_typed<vector<u8>>(mutator, &string::utf8(b"vector<u8>"), vector[0x02]);\n        update_typed<String>(mutator, &string::utf8(b"0x1::string::String"), string::utf8(b"ha"));\n\n        assert!(!read_bool(object, &string::utf8(b"bool")), 10);\n        assert!(read_u8(object, &string::utf8(b"u8")) == 0x21, 11);\n        assert!(read_u16(object, &string::utf8(b"u16")) == 0x22, 12);\n        assert!(read_u32(object, &string::utf8(b"u32")) == 0x23, 13);\n        assert!(read_u64(object, &string::utf8(b"u64")) == 0x24, 14);\n        assert!(read_u128(object, &string::utf8(b"u128")) == 0x25, 15);\n        assert!(read_u256(object, &string::utf8(b"u256")) == 0x26, 16);\n        assert!(read_bytes(object, &string::utf8(b"vector<u8>")) == vector[0x02], 17);\n        assert!(read_string(object, &string::utf8(b"0x1::string::String")) == string::utf8(b"ha"), 18);\n    }\n\n    #[test_only]\n    fun test_end_to_end_add_typed(mutator: &MutatorRef, object: &Object<object::ObjectCore>) acquires PropertyMap {\n        add_typed<bool>(mutator, string::utf8(b"bool"), false);\n        add_typed<u8>(mutator, string::utf8(b"u8"), 0x21);\n        add_typed<u16>(mutator, string::utf8(b"u16"), 0x22);\n        add_typed<u32>(mutator, string::utf8(b"u32"), 0x23);\n        add_typed<u64>(mutator, string::utf8(b"u64"), 0x24);\n        add_typed<u128>(mutator, string::utf8(b"u128"), 0x25);\n        add_typed<u256>(mutator, string::utf8(b"u256"), 0x26);\n        add_typed<vector<u8>>(mutator, string::utf8(b"vector<u8>"), vector[0x02]);\n        add_typed<String>(mutator, string::utf8(b"0x1::string::String"), string::utf8(b"ha"));\n\n        assert!(!read_bool(object, &string::utf8(b"bool")), 21);\n        assert!(read_u8(object, &string::utf8(b"u8")) == 0x21, 22);\n        assert!(read_u16(object, &string::utf8(b"u16")) == 0x22, 23);\n        assert!(read_u32(object, &string::utf8(b"u32")) == 0x23, 24);\n        assert!(read_u64(object, &string::utf8(b"u64")) == 0x24, 25);\n        assert!(read_u128(object, &string::utf8(b"u128")) == 0x25, 26);\n        assert!(read_u256(object, &string::utf8(b"u256")) == 0x26, 27);\n        assert!(read_bytes(object, &string::utf8(b"vector<u8>")) == vector[0x02], 28);\n        assert!(read_string(object, &string::utf8(b"0x1::string::String")) == string::utf8(b"ha"), 29);\n    }\n\n    #[test(creator = @0x123)]\n    fun test_extend_property_map(creator: &signer) acquires PropertyMap {\n        let constructor_ref = object::create_named_object(creator, b"");\n        let extend_ref = object::generate_extend_ref(&constructor_ref);\n        extend(&extend_ref, end_to_end_input());\n\n        let object = object::object_from_constructor_ref<ObjectCore>(&constructor_ref);\n        assert_end_to_end_input(object);\n    }\n\n    #[test_only]\n    fun end_to_end_input(): PropertyMap {\n        prepare_input(\n            vector[\n                string::utf8(b"bool"),\n                string::utf8(b"u8"),\n                string::utf8(b"u16"),\n                string::utf8(b"u32"),\n                string::utf8(b"u64"),\n                string::utf8(b"u128"),\n                string::utf8(b"u256"),\n                string::utf8(b"vector<u8>"),\n                string::utf8(b"0x1::string::String"),\n            ],\n            vector[\n                string::utf8(b"bool"),\n                string::utf8(b"u8"),\n                string::utf8(b"u16"),\n                string::utf8(b"u32"),\n                string::utf8(b"u64"),\n                string::utf8(b"u128"),\n                string::utf8(b"u256"),\n                string::utf8(b"vector<u8>"),\n                string::utf8(b"0x1::string::String"),\n            ],\n            vector[\n                bcs::to_bytes<bool>(&true),\n                bcs::to_bytes<u8>(&0x12),\n                bcs::to_bytes<u16>(&0x1234),\n                bcs::to_bytes<u32>(&0x12345678),\n                bcs::to_bytes<u64>(&0x1234567812345678),\n                bcs::to_bytes<u128>(&0x12345678123456781234567812345678),\n                bcs::to_bytes<u256>(&0x1234567812345678123456781234567812345678123456781234567812345678),\n                bcs::to_bytes<vector<u8>>(&vector[0x01]),\n                bcs::to_bytes<String>(&string::utf8(b"a")),\n            ],\n        )\n    }\n\n    #[test(creator = @0x123)]\n    #[expected_failure(abort_code = 0x10001, location = aptos_std::from_bcs)]\n    fun test_invalid_init(creator: &signer) {\n        let constructor_ref = object::create_named_object(creator, b"");\n\n        let input = prepare_input(\n            vector[string::utf8(b"bool")],\n            vector[string::utf8(b"u16")],\n            vector[bcs::to_bytes<bool>(&true)],\n        );\n        init(&constructor_ref, input);\n    }\n\n    #[test(creator = @0x123)]\n    #[expected_failure(abort_code = 0x10004, location = Self)]\n    fun test_init_wrong_values(creator: &signer) {\n        let constructor_ref = object::create_named_object(creator, b"");\n\n        let input = prepare_input(\n            vector[string::utf8(b"bool"), string::utf8(b"u8")],\n            vector[string::utf8(b"bool"), string::utf8(b"u8")],\n            vector[bcs::to_bytes<bool>(&true)],\n        );\n        init(&constructor_ref, input);\n    }\n\n    #[test(creator = @0x123)]\n    #[expected_failure(abort_code = 0x10005, location = Self)]\n    fun test_init_wrong_types(creator: &signer) {\n        let constructor_ref = object::create_named_object(creator, b"");\n\n        let input = prepare_input(\n            vector[string::utf8(b"bool"), string::utf8(b"u8")],\n            vector[string::utf8(b"bool")],\n            vector[bcs::to_bytes<bool>(&true), bcs::to_bytes<u8>(&0x2)],\n        );\n        init(&constructor_ref, input);\n    }\n\n    #[test(creator = @0x123)]\n    #[expected_failure(abort_code = 0x10001, location = aptos_std::from_bcs)]\n    fun test_invalid_add(creator: &signer) acquires PropertyMap {\n        let constructor_ref = object::create_named_object(creator, b"");\n\n        let input = prepare_input(\n            vector[string::utf8(b"bool")],\n            vector[string::utf8(b"bool")],\n            vector[bcs::to_bytes<bool>(&true)],\n        );\n        init(&constructor_ref, input);\n        let mutator = generate_mutator_ref(&constructor_ref);\n\n        update(&mutator, &string::utf8(b"u16"), string::utf8(b"bool"), bcs::to_bytes<u16>(&0x1234));\n    }\n\n    #[test(creator = @0x123)]\n    #[expected_failure(abort_code = 0x10001, location = aptos_std::from_bcs)]\n    fun test_invalid_update(creator: &signer) acquires PropertyMap {\n        let constructor_ref = object::create_named_object(creator, b"");\n\n        let input = prepare_input(\n            vector[string::utf8(b"bool")],\n            vector[string::utf8(b"bool")],\n            vector[bcs::to_bytes<bool>(&true)],\n        );\n        init(&constructor_ref, input);\n        let mutator = generate_mutator_ref(&constructor_ref);\n\n        update(&mutator, &string::utf8(b"bool"), string::utf8(b"bool"), bcs::to_bytes<u16>(&0x1234));\n    }\n\n    #[test(creator = @0x123)]\n    #[expected_failure(abort_code = 0x10006, location = Self)]\n    fun test_invalid_read(creator: &signer) acquires PropertyMap {\n        let constructor_ref = object::create_named_object(creator, b"");\n        let object = object::object_from_constructor_ref<object::ObjectCore>(&constructor_ref);\n\n        let input = prepare_input(\n            vector[string::utf8(b"bool")],\n            vector[string::utf8(b"bool")],\n            vector[bcs::to_bytes<bool>(&true)],\n        );\n        init(&constructor_ref, input);\n        read_u8(&object, &string::utf8(b"bool"));\n    }\n\n    fun assert_end_to_end_input(object: Object<ObjectCore>) acquires PropertyMap {\n        assert!(read_bool(&object, &string::utf8(b"bool")), 0);\n        assert!(read_u8(&object, &string::utf8(b"u8")) == 0x12, 1);\n        assert!(read_u16(&object, &string::utf8(b"u16")) == 0x1234, 2);\n        assert!(read_u32(&object, &string::utf8(b"u32")) == 0x12345678, 3);\n        assert!(read_u64(&object, &string::utf8(b"u64")) == 0x1234567812345678, 4);\n        assert!(read_u128(&object, &string::utf8(b"u128")) == 0x12345678123456781234567812345678, 5);\n        assert!(\n            read_u256(\n                &object,\n                &string::utf8(b"u256")\n            ) == 0x1234567812345678123456781234567812345678123456781234567812345678,\n            6\n        );\n        assert!(read_bytes(&object, &string::utf8(b"vector<u8>")) == vector[0x01], 7);\n        assert!(read_string(&object, &string::utf8(b"0x1::string::String")) == string::utf8(b"a"), 8);\n\n        assert!(length(&object) == 9, 9);\n    }\n}\n', "name": "property_map.move" }, { "content": '/// This defines an object-based Royalty. The royalty can be applied to either a collection or a\n/// token. Applications should read the royalty from the token, as it will read the appropriate\n/// royalty.\nmodule aptos_token_objects::royalty {\n    use std::error;\n    use std::option::{Self, Option};\n    use aptos_framework::object::{Self, ConstructorRef, ExtendRef, Object};\n\n    friend aptos_token_objects::token;\n\n    /// Royalty does not exist\n    const EROYALTY_DOES_NOT_EXIST: u64 = 1;\n    /// The royalty cannot be greater than 100%\n    const EROYALTY_EXCEEDS_MAXIMUM: u64 = 2;\n    /// The royalty denominator cannot be 0\n    const EROYALTY_DENOMINATOR_IS_ZERO: u64 = 3;\n\n    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]\n    /// The royalty of a token within this collection\n    ///\n    /// Royalties are optional for a collection.  Royalty percentage is calculated\n    /// by (numerator / denominator) * 100%\n    struct Royalty has copy, drop, key {\n        numerator: u64,\n        denominator: u64,\n        /// The recipient of royalty payments. See the `shared_account` for how to handle multiple\n        /// creators.\n        payee_address: address,\n    }\n\n    /// This enables creating or overwriting a `MutatorRef`.\n    struct MutatorRef has drop, store {\n        inner: ExtendRef,\n    }\n\n    /// Add a royalty, given a ConstructorRef.\n    public fun init(ref: &ConstructorRef, royalty: Royalty) {\n        let signer = object::generate_signer(ref);\n        move_to(&signer, royalty);\n    }\n\n    /// Set the royalty if it does not exist, replace it otherwise.\n    public fun update(mutator_ref: &MutatorRef, royalty: Royalty) acquires Royalty {\n        let addr = object::address_from_extend_ref(&mutator_ref.inner);\n        if (exists<Royalty>(addr)) {\n            move_from<Royalty>(addr);\n        };\n\n        let signer = object::generate_signer_for_extending(&mutator_ref.inner);\n        move_to(&signer, royalty);\n    }\n\n    /// Creates a new royalty, verifying that it is a valid percentage\n    public fun create(numerator: u64, denominator: u64, payee_address: address): Royalty {\n        assert!(denominator != 0, error::out_of_range(EROYALTY_DENOMINATOR_IS_ZERO));\n        assert!(numerator <= denominator, error::out_of_range(EROYALTY_EXCEEDS_MAXIMUM));\n\n        Royalty { numerator, denominator, payee_address }\n    }\n\n    public fun generate_mutator_ref(ref: ExtendRef): MutatorRef {\n        MutatorRef { inner: ref }\n    }\n\n    public fun exists_at(addr: address): bool {\n        exists<Royalty>(addr)\n    }\n\n    public(friend) fun delete(addr: address) acquires Royalty {\n        assert!(exists<Royalty>(addr), error::not_found(EROYALTY_DOES_NOT_EXIST));\n        move_from<Royalty>(addr);\n    }\n\n    // Accessors\n    public fun get<T: key>(maybe_royalty: Object<T>): Option<Royalty> acquires Royalty {\n        let obj_addr = object::object_address(&maybe_royalty);\n        if (exists<Royalty>(obj_addr)) {\n            option::some(*borrow_global<Royalty>(obj_addr))\n        } else {\n            option::none()\n        }\n    }\n\n    public fun denominator(royalty: &Royalty): u64 {\n        royalty.denominator\n    }\n\n    public fun numerator(royalty: &Royalty): u64 {\n        royalty.numerator\n    }\n\n    public fun payee_address(royalty: &Royalty): address {\n        royalty.payee_address\n    }\n\n    #[test(creator = @0x123)]\n    fun test_none(creator: &signer) acquires Royalty {\n        let constructor_ref = object::create_named_object(creator, b"");\n        let object = object::object_from_constructor_ref<object::ObjectCore>(&constructor_ref);\n        assert!(option::none() == get(object), 0);\n    }\n\n    #[test(creator = @0x123)]\n    fun test_init_and_update(creator: &signer) acquires Royalty {\n        let constructor_ref = object::create_named_object(creator, b"");\n        let object = object::object_from_constructor_ref<object::ObjectCore>(&constructor_ref);\n        let init_royalty = create(1, 2, @0x123);\n        init(&constructor_ref, init_royalty);\n        assert!(option::some(init_royalty) == get(object), 0);\n        assert!(numerator(&init_royalty) == 1, 1);\n        assert!(denominator(&init_royalty) == 2, 2);\n        assert!(payee_address(&init_royalty) == @0x123, 3);\n\n        let mutator_ref = generate_mutator_ref(object::generate_extend_ref(&constructor_ref));\n        let update_royalty = create(2, 5, @0x456);\n        update(&mutator_ref, update_royalty);\n        assert!(option::some(update_royalty) == get(object), 4);\n        assert!(numerator(&update_royalty) == 2, 5);\n        assert!(denominator(&update_royalty) == 5, 6);\n        assert!(payee_address(&update_royalty) == @0x456, 7);\n    }\n\n    #[test(creator = @0x123)]\n    fun test_update_only(creator: &signer) acquires Royalty {\n        let constructor_ref = object::create_named_object(creator, b"");\n        let object = object::object_from_constructor_ref<object::ObjectCore>(&constructor_ref);\n        assert!(option::none() == get(object), 0);\n\n        let mutator_ref = generate_mutator_ref(object::generate_extend_ref(&constructor_ref));\n        let update_royalty = create(1, 5, @0x123);\n        update(&mutator_ref, update_royalty);\n        assert!(option::some(update_royalty) == get(object), 1);\n    }\n\n    #[test]\n    #[expected_failure(abort_code = 0x60001, location = Self)]\n    fun test_does_not_exist() acquires Royalty {\n        delete(@0x1);\n    }\n\n    #[test]\n    #[expected_failure(abort_code = 0x20002, location = Self)]\n    fun test_exceeds_maximum() {\n        create(6, 5, @0x1);\n    }\n\n    #[test]\n    #[expected_failure(abort_code = 0x20003, location = Self)]\n    fun test_invalid_denominator() {\n        create(6, 0, @0x1);\n    }\n}\n', "name": "royalty.move" }, { "content": `/// This defines an object-based Token. The key differentiating features from the Aptos standard
/// token are:
/// * Decoupled token ownership from token data.
/// * Explicit data model for token metadata via adjacent resources
/// * Extensible framework for tokens
///
module aptos_token_objects::token {
    use std::error;
    use std::option::{Self, Option};
    use std::features;
    use std::string::{Self, String};
    use std::signer;
    use std::vector;
    use aptos_framework::aggregator_v2::{Self, AggregatorSnapshot, DerivedStringSnapshot};
    use aptos_framework::event;
    use aptos_framework::object::{Self, ConstructorRef, Object};
    use aptos_std::string_utils::{to_string};
    use aptos_token_objects::collection::{Self, Collection};
    use aptos_token_objects::royalty::{Self, Royalty};

    #[test_only]
    use aptos_framework::object::ExtendRef;

    /// The token does not exist
    const ETOKEN_DOES_NOT_EXIST: u64 = 1;
    /// The provided signer is not the creator
    const ENOT_CREATOR: u64 = 2;
    /// The field being changed is not mutable
    const EFIELD_NOT_MUTABLE: u64 = 3;
    /// The token name is over the maximum length
    const ETOKEN_NAME_TOO_LONG: u64 = 4;
    /// The URI is over the maximum length
    const EURI_TOO_LONG: u64 = 5;
    /// The description is over the maximum length
    const EDESCRIPTION_TOO_LONG: u64 = 6;
    /// The seed is over the maximum length
    const ESEED_TOO_LONG: u64 = 7;

    const MAX_TOKEN_NAME_LENGTH: u64 = 128;
    const MAX_TOKEN_SEED_LENGTH: u64 = 128;
    const MAX_URI_LENGTH: u64 = 512;
    const MAX_DESCRIPTION_LENGTH: u64 = 2048;

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    /// Represents the common fields to all tokens.
    struct Token has key {
        /// The collection from which this token resides.
        collection: Object<Collection>,
        /// Deprecated in favor of \`index\` inside TokenIdentifiers.
        /// Will be populated until concurrent_token_v2_enabled feature flag is enabled.
        ///
        /// Unique identifier within the collection, optional, 0 means unassigned
        index: u64,
        // DEPRECATED
        /// A brief description of the token.
        description: String,
        /// Deprecated in favor of \`name\` inside TokenIdentifiers.
        /// Will be populated until concurrent_token_v2_enabled feature flag is enabled.
        ///
        /// The name of the token, which should be unique within the collection; the length of name
        /// should be smaller than 128, characters, eg: "Aptos Animal #1234"
        name: String,
        // DEPRECATED
        /// The Uniform Resource Identifier (uri) pointing to the JSON file stored in off-chain
        /// storage; the URL length will likely need a maximum any suggestions?
        uri: String,
        /// Emitted upon any mutation of the token.
        mutation_events: event::EventHandle<MutationEvent>,
    }

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    /// Represents first addition to the common fields for all tokens
    /// Starts being populated once aggregator_v2_api_enabled is enabled.
    struct TokenIdentifiers has key {
        /// Unique identifier within the collection, optional, 0 means unassigned
        index: AggregatorSnapshot<u64>,
        /// The name of the token, which should be unique within the collection; the length of name
        /// should be smaller than 128, characters, eg: "Aptos Animal #1234"
        name: DerivedStringSnapshot,
    }

    // DEPRECATED, NEVER USED
    #[deprecated]
    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct ConcurrentTokenIdentifiers has key {
        index: AggregatorSnapshot<u64>,
        name: AggregatorSnapshot<String>,
    }

    /// This enables burning an NFT, if possible, it will also delete the object. Note, the data
    /// in inner and self occupies 32-bytes each, rather than have both, this data structure makes
    /// a small optimization to support either and take a fixed amount of 34-bytes.
    struct BurnRef has drop, store {
        inner: Option<object::DeleteRef>,
        self: Option<address>,
    }

    /// This enables mutating description and URI by higher level services.
    struct MutatorRef has drop, store {
        self: address,
    }

    /// Contains the mutated fields name. This makes the life of indexers easier, so that they can
    /// directly understand the behavior in a writeset.
    struct MutationEvent has drop, store {
        mutated_field_name: String,
        old_value: String,
        new_value: String
    }

    #[event]
    struct Mutation has drop, store {
        token_address: address,
        mutated_field_name: String,
        old_value: String,
        new_value: String
    }

    inline fun create_common(
        constructor_ref: &ConstructorRef,
        creator_address: address,
        collection_name: String,
        description: String,
        name_prefix: String,
        // If option::some, numbered token is created - i.e. index is appended to the name.
        // If option::none, name_prefix is the full name of the token.
        name_with_index_suffix: Option<String>,
        royalty: Option<Royalty>,
        uri: String,
    ) {
        let collection_addr = collection::create_collection_address(&creator_address, &collection_name);
        let collection = object::address_to_object<Collection>(collection_addr);

        create_common_with_collection(
            constructor_ref,
            collection,
            description,
            name_prefix,
            name_with_index_suffix,
            royalty,
            uri
        )
    }

    inline fun create_common_with_collection(
        constructor_ref: &ConstructorRef,
        collection: Object<Collection>,
        description: String,
        name_prefix: String,
        // If option::some, numbered token is created - i.e. index is appended to the name.
        // If option::none, name_prefix is the full name of the token.
        name_with_index_suffix: Option<String>,
        royalty: Option<Royalty>,
        uri: String,
    ) {
        if (option::is_some(&name_with_index_suffix)) {
            // Be conservative, as we don't know what length the index will be, and assume worst case (20 chars in MAX_U64)
            assert!(
                string::length(&name_prefix) + 20 + string::length(
                    option::borrow(&name_with_index_suffix)
                ) <= MAX_TOKEN_NAME_LENGTH,
                error::out_of_range(ETOKEN_NAME_TOO_LONG)
            );
        } else {
            assert!(string::length(&name_prefix) <= MAX_TOKEN_NAME_LENGTH, error::out_of_range(ETOKEN_NAME_TOO_LONG));
        };
        assert!(string::length(&description) <= MAX_DESCRIPTION_LENGTH, error::out_of_range(EDESCRIPTION_TOO_LONG));
        assert!(string::length(&uri) <= MAX_URI_LENGTH, error::out_of_range(EURI_TOO_LONG));

        let object_signer = object::generate_signer(constructor_ref);

        // TODO[agg_v2](cleanup) once this flag is enabled, cleanup code for aggregator_api_enabled = false.
        // Flag which controls whether any functions from aggregator_v2 module can be called.
        let aggregator_api_enabled = features::aggregator_v2_api_enabled();
        // Flag which controls whether we are going to still continue writing to deprecated fields.
        let concurrent_token_v2_enabled = features::concurrent_token_v2_enabled();

        let (deprecated_index, deprecated_name) = if (aggregator_api_enabled) {
            let index = option::destroy_with_default(
                collection::increment_concurrent_supply(&collection, signer::address_of(&object_signer)),
                aggregator_v2::create_snapshot<u64>(0)
            );

            // If create_numbered_token called us, add index to the name.
            let name = if (option::is_some(&name_with_index_suffix)) {
                aggregator_v2::derive_string_concat(name_prefix, &index, option::extract(&mut name_with_index_suffix))
            } else {
                aggregator_v2::create_derived_string(name_prefix)
            };

            // Until concurrent_token_v2_enabled is enabled, we still need to write to deprecated fields.
            // Otherwise we put empty values there.
            // (we need to do these calls before creating token_concurrent, to avoid copying objects)
            let deprecated_index = if (concurrent_token_v2_enabled) {
                0
            } else {
                aggregator_v2::read_snapshot(&index)
            };
            let deprecated_name = if (concurrent_token_v2_enabled) {
                string::utf8(b"")
            } else {
                aggregator_v2::read_derived_string(&name)
            };

            // If aggregator_api_enabled, we always populate newly added fields
            let token_concurrent = TokenIdentifiers {
                index,
                name,
            };
            move_to(&object_signer, token_concurrent);

            (deprecated_index, deprecated_name)
        } else {
            // If aggregator_api_enabled is disabled, we cannot use increment_concurrent_supply or
            // create TokenIdentifiers, so we fallback to the old behavior.
            let id = collection::increment_supply(&collection, signer::address_of(&object_signer));
            let index = option::get_with_default(&mut id, 0);

            // If create_numbered_token called us, add index to the name.
            let name = if (option::is_some(&name_with_index_suffix)) {
                let name = name_prefix;
                string::append(&mut name, to_string<u64>(&index));
                string::append(&mut name, option::extract(&mut name_with_index_suffix));
                name
            } else {
                name_prefix
            };

            (index, name)
        };

        let token = Token {
            collection,
            index: deprecated_index,
            description,
            name: deprecated_name,
            uri,
            mutation_events: object::new_event_handle(&object_signer),
        };
        move_to(&object_signer, token);

        if (option::is_some(&royalty)) {
            royalty::init(constructor_ref, option::extract(&mut royalty))
        };
    }

    /// Creates a new token object with a unique address and returns the ConstructorRef
    /// for additional specialization.
    /// This takes in the collection object instead of the collection name.
    /// This function must be called if the collection name has been previously changed.
    public fun create_token(
        creator: &signer,
        collection: Object<Collection>,
        description: String,
        name: String,
        royalty: Option<Royalty>,
        uri: String,
    ): ConstructorRef {
        let creator_address = signer::address_of(creator);
        let constructor_ref = object::create_object(creator_address);
        create_common_with_collection(
            &constructor_ref,
            collection,
            description,
            name,
            option::none(),
            royalty,
            uri
        );
        constructor_ref
    }

    /// Creates a new token object with a unique address and returns the ConstructorRef
    /// for additional specialization.
    public fun create(
        creator: &signer,
        collection_name: String,
        description: String,
        name: String,
        royalty: Option<Royalty>,
        uri: String,
    ): ConstructorRef {
        let creator_address = signer::address_of(creator);
        let constructor_ref = object::create_object(creator_address);
        create_common(
            &constructor_ref,
            creator_address,
            collection_name,
            description,
            name,
            option::none(),
            royalty,
            uri
        );
        constructor_ref
    }

    /// Creates a new token object with a unique address and returns the ConstructorRef
    /// for additional specialization.
    /// The name is created by concatenating the (name_prefix, index, name_suffix).
    /// After flag concurrent_token_v2_enabled is enabled, this function will allow
    /// creating tokens in parallel, from the same collection, while providing sequential names.
    ///
    /// This takes in the collection object instead of the collection name.
    /// This function must be called if the collection name has been previously changed.
    public fun create_numbered_token_object(
        creator: &signer,
        collection: Object<Collection>,
        description: String,
        name_with_index_prefix: String,
        name_with_index_suffix: String,
        royalty: Option<Royalty>,
        uri: String,
    ): ConstructorRef {
        let creator_address = signer::address_of(creator);
        let constructor_ref = object::create_object(creator_address);
        create_common_with_collection(
            &constructor_ref,
            collection,
            description,
            name_with_index_prefix,
            option::some(name_with_index_suffix),
            royalty,
            uri
        );
        constructor_ref
    }

    /// Creates a new token object with a unique address and returns the ConstructorRef
    /// for additional specialization.
    /// The name is created by concatenating the (name_prefix, index, name_suffix).
    /// After flag concurrent_token_v2_enabled is enabled, this function will allow
    /// creating tokens in parallel, from the same collection, while providing sequential names.
    public fun create_numbered_token(
        creator: &signer,
        collection_name: String,
        description: String,
        name_with_index_prefix: String,
        name_with_index_suffix: String,
        royalty: Option<Royalty>,
        uri: String,
    ): ConstructorRef {
        let creator_address = signer::address_of(creator);
        let constructor_ref = object::create_object(creator_address);
        create_common(
            &constructor_ref,
            creator_address,
            collection_name,
            description,
            name_with_index_prefix,
            option::some(name_with_index_suffix),
            royalty,
            uri
        );
        constructor_ref
    }

    /// Creates a new token object from a token name and returns the ConstructorRef for
    /// additional specialization.
    /// This function must be called if the collection name has been previously changed.
    public fun create_named_token_object(
        creator: &signer,
        collection: Object<Collection>,
        description: String,
        name: String,
        royalty: Option<Royalty>,
        uri: String,
    ): ConstructorRef {
        let seed = create_token_seed(&collection::name(collection), &name);
        let constructor_ref = object::create_named_object(creator, seed);
        create_common_with_collection(
            &constructor_ref,
            collection,
            description,
            name,
            option::none(),
            royalty,
            uri
        );
        constructor_ref
    }

    /// Creates a new token object from a token name and returns the ConstructorRef for
    /// additional specialization.
    public fun create_named_token(
        creator: &signer,
        collection_name: String,
        description: String,
        name: String,
        royalty: Option<Royalty>,
        uri: String,
    ): ConstructorRef {
        let creator_address = signer::address_of(creator);
        let seed = create_token_seed(&collection_name, &name);

        let constructor_ref = object::create_named_object(creator, seed);
        create_common(
            &constructor_ref,
            creator_address,
            collection_name,
            description,
            name,
            option::none(),
            royalty,
            uri
        );
        constructor_ref
    }

    /// Creates a new token object from a token name and seed.
    /// Returns the ConstructorRef for additional specialization.
    /// This function must be called if the collection name has been previously changed.
    public fun create_named_token_from_seed(
        creator: &signer,
        collection: Object<Collection>,
        description: String,
        name: String,
        seed: String,
        royalty: Option<Royalty>,
        uri: String,
    ): ConstructorRef {
        let seed = create_token_name_with_seed(&collection::name(collection), &name, &seed);
        let constructor_ref = object::create_named_object(creator, seed);
        create_common_with_collection(&constructor_ref, collection, description, name, option::none(), royalty, uri);
        constructor_ref
    }

    #[deprecated]
    /// DEPRECATED: Use \`create\` instead for identical behavior.
    ///
    /// Creates a new token object from an account GUID and returns the ConstructorRef for
    /// additional specialization.
    public fun create_from_account(
        creator: &signer,
        collection_name: String,
        description: String,
        name: String,
        royalty: Option<Royalty>,
        uri: String,
    ): ConstructorRef {
        let creator_address = signer::address_of(creator);
        let constructor_ref = object::create_object_from_account(creator);
        create_common(
            &constructor_ref,
            creator_address,
            collection_name,
            description,
            name,
            option::none(),
            royalty,
            uri
        );
        constructor_ref
    }

    /// Generates the token's address based upon the creator's address, the collection's name and the token's name.
    public fun create_token_address(creator: &address, collection: &String, name: &String): address {
        object::create_object_address(creator, create_token_seed(collection, name))
    }

    #[view]
    /// Generates the token's address based upon the creator's address, the collection object and the token's name and seed.
    public fun create_token_address_with_seed(creator: address, collection: String, name: String, seed: String): address {
        let seed = create_token_name_with_seed(&collection, &name, &seed);
        object::create_object_address(&creator, seed)
    }

    /// Named objects are derived from a seed, the token's seed is its name appended to the collection's name.
    public fun create_token_seed(collection: &String, name: &String): vector<u8> {
        assert!(string::length(name) <= MAX_TOKEN_NAME_LENGTH, error::out_of_range(ETOKEN_NAME_TOO_LONG));
        let seed = *string::bytes(collection);
        vector::append(&mut seed, b"::");
        vector::append(&mut seed, *string::bytes(name));
        seed
    }

    public fun create_token_name_with_seed(collection: &String, name: &String, seed: &String): vector<u8> {
        assert!(string::length(seed) <= MAX_TOKEN_SEED_LENGTH, error::out_of_range(ESEED_TOO_LONG));
        let seeds = create_token_seed(collection, name);
        vector::append(&mut seeds, *string::bytes(seed));
        seeds
    }

    /// Creates a MutatorRef, which gates the ability to mutate any fields that support mutation.
    public fun generate_mutator_ref(ref: &ConstructorRef): MutatorRef {
        let object = object::object_from_constructor_ref<Token>(ref);
        MutatorRef { self: object::object_address(&object) }
    }

    /// Creates a BurnRef, which gates the ability to burn the given token.
    public fun generate_burn_ref(ref: &ConstructorRef): BurnRef {
        let (inner, self) = if (object::can_generate_delete_ref(ref)) {
            let delete_ref = object::generate_delete_ref(ref);
            (option::some(delete_ref), option::none())
        } else {
            let addr = object::address_from_constructor_ref(ref);
            (option::none(), option::some(addr))
        };
        BurnRef { self, inner }
    }

    /// Extracts the tokens address from a BurnRef.
    public fun address_from_burn_ref(ref: &BurnRef): address {
        if (option::is_some(&ref.inner)) {
            object::address_from_delete_ref(option::borrow(&ref.inner))
        } else {
            *option::borrow(&ref.self)
        }
    }

    // Accessors

    inline fun borrow<T: key>(token: &Object<T>): &Token acquires Token {
        let token_address = object::object_address(token);
        assert!(
            exists<Token>(token_address),
            error::not_found(ETOKEN_DOES_NOT_EXIST),
        );
        borrow_global<Token>(token_address)
    }

    #[view]
    public fun creator<T: key>(token: Object<T>): address acquires Token {
        collection::creator(borrow(&token).collection)
    }

    #[view]
    public fun collection_name<T: key>(token: Object<T>): String acquires Token {
        collection::name(borrow(&token).collection)
    }

    #[view]
    public fun collection_object<T: key>(token: Object<T>): Object<Collection> acquires Token {
        borrow(&token).collection
    }

    #[view]
    public fun description<T: key>(token: Object<T>): String acquires Token {
        borrow(&token).description
    }

    // To be added if/when needed - i.e. if there is a need to access name of the numbered token
    // within the transaction that creates it, to set additional application-specific fields.
    //
    // /// This method allows minting to happen in parallel, making it efficient.
    // fun name_snapshot<T: key>(token: &Object<T>): AggregatorSnapshot<String> acquires Token, TokenIdentifiers {
    //     let token_address = object::object_address(token);
    //     if (exists<TokenIdentifiers>(token_address)) {
    //         aggregator_v2::copy_snapshot(&borrow_global<TokenIdentifiers>(token_address).name)
    //     } else {
    //         aggregator_v2::create_snapshot(borrow(token).name)
    //     }
    // }

    #[view]
    /// Avoid this method in the same transaction as the token is minted
    /// as that would prohibit transactions to be executed in parallel.
    public fun name<T: key>(token: Object<T>): String acquires Token, TokenIdentifiers {
        let token_address = object::object_address(&token);
        if (exists<TokenIdentifiers>(token_address)) {
            aggregator_v2::read_derived_string(&borrow_global<TokenIdentifiers>(token_address).name)
        } else {
            borrow(&token).name
        }
    }

    #[view]
    public fun uri<T: key>(token: Object<T>): String acquires Token {
        borrow(&token).uri
    }

    #[view]
    public fun royalty<T: key>(token: Object<T>): Option<Royalty> acquires Token {
        borrow(&token);
        let royalty = royalty::get(token);
        if (option::is_some(&royalty)) {
            royalty
        } else {
            let creator = creator(token);
            let collection_name = collection_name(token);
            let collection_address = collection::create_collection_address(&creator, &collection_name);
            let collection = object::address_to_object<collection::Collection>(collection_address);
            royalty::get(collection)
        }
    }

    // To be added if/when needed - i.e. if there is a need to access index of the token
    // within the transaction that creates it, to set additional application-specific fields.
    //
    // /// This method allows minting to happen in parallel, making it efficient.
    // fun index_snapshot<T: key>(token: &Object<T>): AggregatorSnapshot<u64> acquires Token, TokenIdentifiers {
    //     let token_address = object::object_address(token);
    //     if (exists<TokenIdentifiers>(token_address)) {
    //         aggregator_v2::copy_snapshot(&borrow_global<TokenIdentifiers>(token_address).index)
    //     } else {
    //         aggregator_v2::create_snapshot(borrow(token).index)
    //     }
    // }

    #[view]
    /// Avoid this method in the same transaction as the token is minted
    /// as that would prohibit transactions to be executed in parallel.
    public fun index<T: key>(token: Object<T>): u64 acquires Token, TokenIdentifiers {
        let token_address = object::object_address(&token);
        if (exists<TokenIdentifiers>(token_address)) {
            aggregator_v2::read_snapshot(&borrow_global<TokenIdentifiers>(token_address).index)
        } else {
            borrow(&token).index
        }
    }

    // Mutators

    inline fun borrow_mut(mutator_ref: &MutatorRef): &mut Token acquires Token {
        assert!(
            exists<Token>(mutator_ref.self),
            error::not_found(ETOKEN_DOES_NOT_EXIST),
        );
        borrow_global_mut<Token>(mutator_ref.self)
    }

    public fun burn(burn_ref: BurnRef) acquires Token, TokenIdentifiers {
        let (addr, previous_owner) = if (option::is_some(&burn_ref.inner)) {
            let delete_ref = option::extract(&mut burn_ref.inner);
            let addr = object::address_from_delete_ref(&delete_ref);
            let previous_owner = object::owner(object::address_to_object<Token>(addr));
            object::delete(delete_ref);
            (addr, previous_owner)
        } else {
            let addr = option::extract(&mut burn_ref.self);
            let previous_owner = object::owner(object::address_to_object<Token>(addr));
            (addr, previous_owner)
        };

        if (royalty::exists_at(addr)) {
            royalty::delete(addr)
        };

        let Token {
            collection,
            index: deprecated_index,
            description: _,
            name: _,
            uri: _,
            mutation_events,
        } = move_from<Token>(addr);

        let index = if (exists<TokenIdentifiers>(addr)) {
            let TokenIdentifiers {
                index,
                name: _,
            } = move_from<TokenIdentifiers>(addr);
            aggregator_v2::read_snapshot(&index)
        } else {
            deprecated_index
        };

        event::destroy_handle(mutation_events);
        collection::decrement_supply(&collection, addr, option::some(index), previous_owner);
    }

    public fun set_description(mutator_ref: &MutatorRef, description: String) acquires Token {
        assert!(string::length(&description) <= MAX_DESCRIPTION_LENGTH, error::out_of_range(EDESCRIPTION_TOO_LONG));
        let token = borrow_mut(mutator_ref);
        if (std::features::module_event_migration_enabled()) {
            event::emit(Mutation {
                token_address: mutator_ref.self,
                mutated_field_name: string::utf8(b"description"),
                old_value: token.description,
                new_value: description
            })
        };
        event::emit_event(
            &mut token.mutation_events,
            MutationEvent {
                mutated_field_name: string::utf8(b"description"),
                old_value: token.description,
                new_value: description
            },
        );
        token.description = description;
    }

    public fun set_name(mutator_ref: &MutatorRef, name: String) acquires Token, TokenIdentifiers {
        assert!(string::length(&name) <= MAX_TOKEN_NAME_LENGTH, error::out_of_range(ETOKEN_NAME_TOO_LONG));

        let token = borrow_mut(mutator_ref);

        let old_name = if (exists<TokenIdentifiers>(mutator_ref.self)) {
            let token_concurrent = borrow_global_mut<TokenIdentifiers>(mutator_ref.self);
            let old_name = aggregator_v2::read_derived_string(&token_concurrent.name);
            token_concurrent.name = aggregator_v2::create_derived_string(name);
            old_name
        } else {
            let old_name = token.name;
            token.name = name;
            old_name
        };

        if (std::features::module_event_migration_enabled()) {
            event::emit(Mutation {
                token_address: mutator_ref.self,
                mutated_field_name: string::utf8(b"name"),
                old_value: old_name,
                new_value: name
            })
        };
        event::emit_event(
            &mut token.mutation_events,
            MutationEvent {
                mutated_field_name: string::utf8(b"name"),
                old_value: old_name,
                new_value: name
            },
        );
    }

    public fun set_uri(mutator_ref: &MutatorRef, uri: String) acquires Token {
        assert!(string::length(&uri) <= MAX_URI_LENGTH, error::out_of_range(EURI_TOO_LONG));
        let token = borrow_mut(mutator_ref);
        if (std::features::module_event_migration_enabled()) {
            event::emit(Mutation {
                token_address: mutator_ref.self,
                mutated_field_name: string::utf8(b"uri"),
                old_value: token.uri,
                new_value: uri,
            })
        };
        event::emit_event(
            &mut token.mutation_events,
            MutationEvent {
                mutated_field_name: string::utf8(b"uri"),
                old_value: token.uri,
                new_value: uri,
            },
        );
        token.uri = uri;
    }

    #[test(creator = @0x123, trader = @0x456)]
    fun test_create_and_transfer(creator: &signer, trader: &signer) acquires Token {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, 1);
        create_token_helper(creator, collection_name, token_name);

        let creator_address = signer::address_of(creator);
        let token_addr = create_token_address(&creator_address, &collection_name, &token_name);
        let token = object::address_to_object<Token>(token_addr);
        assert!(object::owner(token) == creator_address, 1);
        object::transfer(creator, token, signer::address_of(trader));
        assert!(object::owner(token) == signer::address_of(trader), 1);

        let expected_royalty = royalty::create(25, 10000, creator_address);
        assert!(option::some(expected_royalty) == royalty(token), 2);
    }

    #[test(creator = @0x123, trader = @0x456)]
    fun test_create_and_transfer_token_with_seed(creator: &signer, trader: &signer) acquires Token {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        let extend_ref = create_collection_helper(creator, collection_name, 1);
        let collection = get_collection_from_ref(&extend_ref);
        let seed = string::utf8(b"seed");
        create_token_object_with_seed_helper(creator, collection, token_name, seed);

        let creator_address = signer::address_of(creator);
        // Calculate the token address with collection, token name and seed.
        let token_addr = create_token_address_with_seed(creator_address, collection_name, token_name, seed);
        let token = object::address_to_object<Token>(token_addr);
        assert!(object::owner(token) == creator_address, 1);
        object::transfer(creator, token, signer::address_of(trader));
        assert!(object::owner(token) == signer::address_of(trader), 1);

        let expected_royalty = royalty::create(25, 10000, creator_address);
        assert!(option::some(expected_royalty) == royalty(token), 2);
    }

    #[test(creator = @0x123)]
    fun test_collection_royalty(creator: &signer) acquires Token {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        let creator_address = signer::address_of(creator);
        let expected_royalty = royalty::create(10, 1000, creator_address);
        let constructor_ref = collection::create_fixed_collection(
            creator,
            string::utf8(b"collection description"),
            5,
            collection_name,
            option::some(expected_royalty),
            string::utf8(b"collection uri"),
        );

        let collection = object::object_from_constructor_ref<Collection>(&constructor_ref);
        create_named_token_object(
            creator,
            collection,
            string::utf8(b"token description"),
            token_name,
            option::none(),
            string::utf8(b"token uri"),
        );

        let token_addr = create_token_address(&creator_address, &collection_name, &token_name);
        let token = object::address_to_object<Token>(token_addr);
        assert!(option::some(expected_royalty) == royalty(token), 0);
    }

    #[test(creator = @0x123)]
    fun test_no_royalty(creator: &signer) acquires Token {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        collection::create_unlimited_collection(
            creator,
            string::utf8(b"collection description"),
            collection_name,
            option::none(),
            string::utf8(b"collection uri"),
        );

        create_named_token(
            creator,
            collection_name,
            string::utf8(b"token description"),
            token_name,
            option::none(),
            string::utf8(b"token uri"),
        );

        let creator_address = signer::address_of(creator);
        let token_addr = create_token_address(&creator_address, &collection_name, &token_name);
        let token = object::address_to_object<Token>(token_addr);
        assert!(option::none() == royalty(token), 0);
    }

    #[test(creator = @0x123)]
    #[expected_failure(abort_code = 0x20002, location = aptos_token_objects::collection)]
    fun test_too_many_tokens(creator: &signer) {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, 1);
        create_token_helper(creator, collection_name, token_name);
        create_token_helper(creator, collection_name, string::utf8(b"bad"));
    }

    #[test(creator = @0x123)]
    #[expected_failure(abort_code = 0x80001, location = aptos_framework::object)]
    fun test_duplicate_tokens(creator: &signer) {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, 2);
        create_token_helper(creator, collection_name, token_name);
        create_token_helper(creator, collection_name, token_name);
    }

    #[test(creator = @0x123)]
    fun test_set_description(creator: &signer) acquires Token {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, 1);
        let mutator_ref = create_token_with_mutation_ref(creator, collection_name, token_name);
        let token = object::address_to_object<Token>(
            create_token_address(&signer::address_of(creator), &collection_name, &token_name),
        );

        let description = string::utf8(b"no fail");
        assert!(description != description(token), 0);
        set_description(&mutator_ref, description);
        assert!(description == description(token), 1);
    }

    #[test(creator = @0x123)]
    fun test_set_name(creator: &signer) acquires Token, TokenIdentifiers {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, 1);
        let mutator_ref = create_token_with_mutation_ref(creator, collection_name, token_name);
        let token = object::address_to_object<Token>(
            create_token_address(&signer::address_of(creator), &collection_name, &token_name),
        );

        let name = string::utf8(b"no fail");
        assert!(name != name(token), 0);
        set_name(&mutator_ref, name);
        assert!(name == name(token), 2);
    }

    #[test(creator = @0x123)]
    fun test_set_uri(creator: &signer) acquires Token {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, 1);
        let mutator_ref = create_token_with_mutation_ref(creator, collection_name, token_name);
        let token = object::address_to_object<Token>(
            create_token_address(&signer::address_of(creator), &collection_name, &token_name),
        );

        let uri = string::utf8(b"no fail");
        assert!(uri != uri(token), 0);
        set_uri(&mutator_ref, uri);
        assert!(uri == uri(token), 1);
    }

    #[test(creator = @0x123)]
    fun test_burn_without_royalty(creator: &signer) acquires Token, TokenIdentifiers {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, 1);
        let constructor_ref = create_named_token(
            creator,
            collection_name,
            string::utf8(b"token description"),
            token_name,
            option::none(),
            string::utf8(b"token uri"),
        );
        let burn_ref = generate_burn_ref(&constructor_ref);
        let token_addr = object::address_from_constructor_ref(&constructor_ref);
        assert!(exists<Token>(token_addr), 0);
        assert!(!royalty::exists_at(token_addr), 3);
        burn(burn_ref);
        assert!(!exists<Token>(token_addr), 2);
        assert!(!royalty::exists_at(token_addr), 3);
    }

    #[test(creator = @0x123)]
    fun test_burn_with_royalty(creator: &signer) acquires Token, TokenIdentifiers {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, 1);
        let constructor_ref = create_named_token(
            creator,
            collection_name,
            string::utf8(b"token description"),
            token_name,
            option::some(royalty::create(1, 1, signer::address_of(creator))),
            string::utf8(b"token uri"),
        );
        let burn_ref = generate_burn_ref(&constructor_ref);
        let token_addr = object::address_from_constructor_ref(&constructor_ref);
        assert!(exists<Token>(token_addr), 0);
        assert!(royalty::exists_at(token_addr), 1);
        burn(burn_ref);
        assert!(!exists<Token>(token_addr), 2);
        assert!(!royalty::exists_at(token_addr), 3);
        assert!(object::is_object(token_addr), 4);
    }

    #[test(creator = @0x123)]
    fun test_create_from_account_burn_and_delete(creator: &signer) acquires Token, TokenIdentifiers {
        use aptos_framework::account;

        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        create_collection_helper(creator, collection_name, 1);
        account::create_account_for_test(signer::address_of(creator));
        let constructor_ref = create_from_account(
            creator,
            collection_name,
            string::utf8(b"token description"),
            token_name,
            option::none(),
            string::utf8(b"token uri"),
        );
        let burn_ref = generate_burn_ref(&constructor_ref);
        let token_addr = object::address_from_constructor_ref(&constructor_ref);
        assert!(exists<Token>(token_addr), 0);
        burn(burn_ref);
        assert!(!exists<Token>(token_addr), 1);
        assert!(!object::is_object(token_addr), 2);
    }

    #[test(creator = @0x123, fx = @std)]
    fun test_create_burn_and_delete(creator: &signer, fx: signer) acquires Token, TokenIdentifiers {
        use aptos_framework::account;
        use std::features;

        let feature = features::get_auids();
        features::change_feature_flags_for_testing(&fx, vector[feature], vector[]);

        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        let extend_ref = create_collection_helper(creator, collection_name, 1);
        let collection = get_collection_from_ref(&extend_ref);
        account::create_account_for_test(signer::address_of(creator));
        let constructor_ref = create_token(
            creator,
            collection,
            string::utf8(b"token description"),
            token_name,
            option::none(),
            string::utf8(b"token uri"),
        );
        let burn_ref = generate_burn_ref(&constructor_ref);
        let token_addr = object::address_from_constructor_ref(&constructor_ref);
        assert!(exists<Token>(token_addr), 0);
        burn(burn_ref);
        assert!(!exists<Token>(token_addr), 1);
        assert!(!object::is_object(token_addr), 2);
    }

    #[test(fx = @aptos_framework, creator = @0x123)]
    fun test_upgrade_to_concurrent_and_numbered_tokens(fx: &signer, creator: &signer) acquires Token, TokenIdentifiers {
        use std::debug;

        let feature = features::get_concurrent_token_v2_feature();
        let agg_feature = features::get_aggregator_v2_api_feature();
        let auid_feature = features::get_auids();
        let module_event_feature = features::get_module_event_feature();
        features::change_feature_flags_for_testing(fx, vector[auid_feature, module_event_feature], vector[feature, agg_feature]);

        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        let extend_ref = create_collection_helper(creator, collection_name, 2);
        let collection = get_collection_from_ref(&extend_ref);
        let token_1_ref = create_numbered_token_helper(creator, collection, token_name);
        let token_1_name = name(object::object_from_constructor_ref<Token>(&token_1_ref));
        debug::print(&token_1_name);
        assert!(token_1_name == std::string::utf8(b"token name1"), 1);

        features::change_feature_flags_for_testing(fx, vector[feature, agg_feature], vector[]);
        collection::upgrade_to_concurrent(&extend_ref);

        let token_2_ref = create_numbered_token_helper(creator, collection, token_name);
        assert!(name(object::object_from_constructor_ref<Token>(&token_2_ref)) == std::string::utf8(b"token name2"), 1);
        assert!(vector::length(&event::emitted_events<collection::Mint>()) == 2, 0);

        let burn_ref = generate_burn_ref(&token_2_ref);
        let token_addr = object::address_from_constructor_ref(&token_2_ref);
        assert!(exists<Token>(token_addr), 0);
        burn(burn_ref);
        assert!(vector::length(&event::emitted_events<collection::Burn>()) == 1, 0);
    }

    #[test(creator = @0x123)]
    /// This test verifies that once the collection name can be changed, tokens can still be be minted from the collection.
    fun test_change_collection_name(creator: &signer) {
        let collection_name = string::utf8(b"collection name");
        let token_name = string::utf8(b"token name");

        let constructor_ref = &create_fixed_collection(creator, collection_name, 5);
        let collection = get_collection_from_ref(&object::generate_extend_ref(constructor_ref));
        let mutator_ref = collection::generate_mutator_ref(constructor_ref);

        create_token_with_collection_helper(creator, collection, token_name);
        collection::set_name(&mutator_ref, string::utf8(b"new collection name"));
        create_token_with_collection_helper(creator, collection, token_name);

        assert!(collection::count(collection) == option::some(2), 0);
    }

    #[test_only]
    fun create_collection_helper(creator: &signer, collection_name: String, max_supply: u64): ExtendRef {
        let constructor_ref = create_fixed_collection(creator, collection_name, max_supply);
        object::generate_extend_ref(&constructor_ref)
    }

    #[test_only]
    fun create_fixed_collection(creator: &signer, collection_name: String, max_supply: u64): ConstructorRef {
        collection::create_fixed_collection(
            creator,
            string::utf8(b"collection description"),
            max_supply,
            collection_name,
            option::none(),
            string::utf8(b"collection uri"),
        )
    }

    #[test_only]
    fun create_token_helper(creator: &signer, collection_name: String, token_name: String): ConstructorRef {
        create_named_token(
            creator,
            collection_name,
            string::utf8(b"token description"),
            token_name,
            option::some(royalty::create(25, 10000, signer::address_of(creator))),
            string::utf8(b"uri"),
        )
    }

    #[test_only]
    fun create_token_with_collection_helper(creator: &signer, collection: Object<Collection>, token_name: String): ConstructorRef {
        create_named_token_object(
            creator,
            collection,
            string::utf8(b"token description"),
            token_name,
            option::some(royalty::create(25, 10000, signer::address_of(creator))),
            string::utf8(b"uri"),
        )
    }

    #[test_only]
    fun create_token_object_with_seed_helper(creator: &signer, collection: Object<Collection>, token_name: String, seed: String): ConstructorRef {
        create_named_token_from_seed(
            creator,
            collection,
            string::utf8(b"token description"),
            token_name,
            seed,
            option::some(royalty::create(25, 10000, signer::address_of(creator))),
            string::utf8(b"uri"),
        )
    }

    #[test_only]
    fun create_numbered_token_helper(creator: &signer, collection: Object<Collection>, token_prefix: String): ConstructorRef {
        create_numbered_token_object(
            creator,
            collection,
            string::utf8(b"token description"),
            token_prefix,
            string::utf8(b""),
            option::some(royalty::create(25, 10000, signer::address_of(creator))),
            string::utf8(b"uri"),
        )
    }

    #[test_only]
    fun create_token_with_mutation_ref(
        creator: &signer,
        collection_name: String,
        token_name: String,
    ): MutatorRef {
        let constructor_ref = create_token_helper(creator, collection_name, token_name);
        generate_mutator_ref(&constructor_ref)
    }

    #[test_only]
    fun get_collection_from_ref(extend_ref: &ExtendRef): Object<Collection> {
        let collection_address = signer::address_of(&object::generate_signer_for_extending(extend_ref));
        object::address_to_object<Collection>(collection_address)
    }
}
`, "name": "token.move" }];
