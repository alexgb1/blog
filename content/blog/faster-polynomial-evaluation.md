---
title: "Faster Polynomial Evaluation"
date: 2020-09-06T12:15:14+01:00
slug: ""
description: ""
keywords: ["polynomial", "math", "scala"]
draft: false
tags: ["polynomial", "math", "scala"]
math: false
toc: false
---


This might not be one of your daily problems. Evaluating polynomials seems to be a simple task until the coefficients become big numbers, e.g. 1024 bits or more, and could impact your whole software component.

## Classic evaluation

A simple way to evaluate a polynomial is:

```scala
def classicCompute(variable: BigInt): BigInt = {
    coefficients
    .zipWithIndex
    .foldLeft(BigInt(0)) {
       case (accumulator, (coefficient, i)) => 
          accumulator + coefficient * variable.pow(i)
    }
  }
```

## Optimized evaluation

In order to optimize a polynomial evaluation, one could use [Horner's method](https://en.wikipedia.org/wiki/Horner%27s_method), which implies a significant [improvement](https://en.wikipedia.org/wiki/Horner%27s_method#Efficiency) when using big numbers.

Translated into code, the [evaluation](https://en.wikipedia.org/wiki/Horner%27s_method#Polynomial_evaluation_and_long_division) looks like this:

```scala
def compute(variable: BigInt): BigInt = {
    @tailrec
    def loop(accumulator: BigInt, coefficients: List[BigInt]): BigInt = {
      coefficients match {
        case Nil => accumulator
        case coefficient :: remaining =>
          loop(coefficient + variable * accumulator, remaining)
      }
    }

    loop(0, coefficients.reverse)
  }
```

## In the real world

Given the two implementation, I've setup a benchmark test using a sbt [plugin](https://github.com/ktoso/sbt-jmh) for the JMH (Java Microbenchmark Harness). 
The results for 4096bit size numbers and 20 coefficients on my machine (`Intel i7-7500U CPU @ 2.70GHz`) are:

```
Benchmark                            Mode   Cnt    Score    Error   Units
evaluatePolynomialClassic           thrpt     3    0.065 ±  0.026  ops/ms
evaluatePolynomialHorner            thrpt     3    0.135 ±  0.072  ops/ms
evaluatePolynomialClassic            avgt     3   23.294 ± 48.218   ms/op
evaluatePolynomialHorner             avgt     3    8.756 ± 30.397   ms/op
evaluatePolynomialClassic          sample  1048   28.631 ±  1.211   ms/op
evaluatePolynomialClassic·p0.00    sample         12.550            ms/op
evaluatePolynomialClassic·p0.50    sample         25.330            ms/op
evaluatePolynomialClassic·p0.90    sample         45.181            ms/op
evaluatePolynomialClassic·p0.95    sample         53.549            ms/op
evaluatePolynomialClassic·p0.99    sample         67.898            ms/op
evaluatePolynomialClassic·p0.999   sample        102.723            ms/op
evaluatePolynomialClassic·p0.9999  sample        103.154            ms/op
evaluatePolynomialClassic·p1.00    sample        103.154            ms/op
evaluatePolynomialHorner           sample  7838    3.823 ±  0.018   ms/op
evaluatePolynomialHorner·p0.00     sample          3.453            ms/op
evaluatePolynomialHorner·p0.50     sample          3.678            ms/op
evaluatePolynomialHorner·p0.90     sample          4.293            ms/op
evaluatePolynomialHorner·p0.95     sample          4.645            ms/op
evaluatePolynomialHorner·p0.99     sample          6.070            ms/op
evaluatePolynomialHorner·p0.999    sample          7.196            ms/op
evaluatePolynomialHorner·p0.9999   sample         12.157            ms/op
evaluatePolynomialHorner·p1.00     sample         12.157            ms/op
evaluatePolynomialClassic              ss     3   24.851 ± 33.086   ms/op
evaluatePolynomialHorner               ss     3   17.525 ± 11.917   ms/op
```

As we can see in the outcome above, the classic evaluation is easily outperformed by the Horner's method, sometimes being 8x faster than the classic one.

Later on we'll see if there are any actual usages out there in the real world.

