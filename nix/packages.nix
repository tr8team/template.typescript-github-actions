{ nixpkgs ? import <nixpkgs> { } }:
let
  pkgs = rec {
    atomi_classic = (
      with import (fetchTarball "https://github.com/kirinnee/test-nix-repo/archive/refs/tags/v8.1.0.tar.gz");
      {
        inherit sg;
      }
    );
    atomi = (
      with import (fetchTarball "https://github.com/kirinnee/test-nix-repo/archive/refs/tags/v17.1.0.tar.gz");
      {
        inherit pls precommit-patch-nix gattai action_docs;
      }
    );
    "Unstable 6th Mar 2023" = (
      with import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/f5ffd5787786dde3a8bf648c7a1b5f78c4e01abb.tar.gz") { };
      {
        inherit
          coreutils
          gnugrep
          awscli2
          pre-commit
          gitlint
          nodejs-16_x
          jq
          nixpkgs-fmt
          shfmt
          findutils
          gnused
          git
          gomplate
          shellcheck;
        wrangler = nodePackages.wrangler;
        node18 = nodejs;
        webstorm = jetbrains.webstorm;
        prettier = nodePackages.prettier;
        pnpm = nodePackages.pnpm;
      }
    );
  };
in
with pkgs;
atomi //
atomi_classic //
pkgs."Unstable 6th Mar 2023"
