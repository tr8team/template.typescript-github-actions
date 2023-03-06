{ nixpkgs ? import <nixpkgs> { } }:
let pkgs = import ./packages.nix { inherit nixpkgs; }; in
with pkgs;
{
  system = [
    coreutils
    gnugrep
    findutils
    gnused
    jq
  ];

  main = [
    pls
    nodejs-16_x
    pnpm
    gattai
  ];

  dev = [
    pnpm
    webstorm
  ];

  lint = [
    action_docs
    precommit-patch-nix
    pre-commit
    nixpkgs-fmt
    prettier
    shfmt
    shellcheck
    gitlint
    sg
  ];

  ci = [
    wrangler
    gomplate
    git
    awscli2
  ];

  releaser = [
    node18
    sg
  ];
}
