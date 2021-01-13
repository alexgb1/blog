---
title: "Secret Sharing"
date: 2020-12-28T11:13:43+01:00
slug: ""
description: ""
keywords: ["secret-sharing", "scala", "polynomial"]
draft: false
tags: ["secret-sharing", "scala", "polynomial", "math"]
math: true
toc: false
---

The general idea of secret sharing begins with a __secret__ which is divided into multiple pieces called __shares__. Each share is assigned to a user in such a manner that a given subset of shares from users can be used to reconstruct the original secret.

The motivation for this concept is related to the ability to safeguard cryptographic keys from loss or exposure. Secret sharing schemes are multi-party protocols related to the key establishment, where for example a private key in an asymmetric cryptosystem can be split between multiple entities for safely controlling decryption or signature creation.

Not all secret sharing schemes are considered secure. In this post, I'll refer to one which in its original format ticks most of the boxes. 

## Shamir's secret sharing scheme
[Shamir's secret sharing scheme](https://dl.acm.org/doi/abs/10.1145/359168.359176) is a $(t,n)$ threshold scheme, where a trusted party distributes shares of a given secret $S$ to $n$ users. Any group of $t$ or more users which provide their shares are capable of recovering the initial secret $S$.


The scheme consists of two phases. A *setup* phase and a *reconstruction* phase. 

### Setup phase
In the *setup* phase, the trusted party $TP$ starts with a secret integer $S \geq 0$ which it wants to share between $n$ users, then : 
1. $TP$ picks a prime $P \gt S$ and defines $c_0=S$
2. $TP$ selects $t-1$ random, independent coefficients $c_1,\dots,c_{t-1}$, where $0 \leq c_j \leq P-1$ which define the polynomial over $Z_P$, $$f(x)=\sum_{j=0}^{t-1} c_j x^j$$
 The source code can be found [here](https://github.com/alexgb1/secret-sharing/blob/main/src/main/scala/org/example/secretsharing/shamir/ShamirSecretSharingScheme.scala#L48).
3. $TP$ computes $S_i=f(i) mod \ P$, for $0 \leq i \leq P-1$, and transfers each share $S_i$, in a secure manner, to user $U_i$, along with its public index $i$. The source code can be found [here](https://github.com/alexgb1/secret-sharing/blob/main/src/main/scala/org/example/secretsharing/shamir/ShamirSecretSharingScheme.scala#L14).

### Reconstruction phase
In the *reconstruction* phase, any group of $t$ or more users pool their shares as distinct points $(x, y) = (i, S_i)$, can compute the coefficients $c_j, 1 \leq j \leq t-1 $ of $f(x)$ by using the [Lagrange interpolation](https://en.wikipedia.org/wiki/Lagrange_polynomial). Using the computed coefficients, the secret can be recovered from $f(0) = S$. Since $f(0) = S$, the shared secret can be expressed as:

 $$S = \sum_{i=1}^{t}k_i y_i$$ where $ k_i $ is: $$k_i = \prod_{j=1, j \neq i}^{t} \frac{x_j}{x_j - x_i}$$

The source code can be found [here](https://github.com/alexgb1/secret-sharing/blob/main/src/main/scala/org/example/secretsharing/shamir/ShamirSecretSharingScheme.scala#L22).
### Properties
This scheme is commonly used because of the following properties:
* *ideal* - The size of a share is the same as the secret, said to have *information rate* 1. The information rate is the bit size ratio as (size of the shared secret) / (size of the user's share).
* *perfect* - Given information of any $t-1$ or less shares provide no advantage, all $
0 \leq S \leq p-1 $ are equally probable.
* *extendable* - New shares can be computed for newly joined users without impacting the existing shares.


## Does it work?

The full implementation of the Shamir's secret sharing scheme using Scala can be found [here](https://github.com/alexgb1/secret-sharing).

The [dealer test](https://github.com/alexgb1/secret-sharing/blob/main/src/test/scala/org/example/secretsharing/DealerTest.scala#L11) shows in which configurations the secret can or cannot be reconstructed, satisfying the format of $t$ out of $n$ threshold secret sharing scheme.