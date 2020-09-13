---
title: "Your API as Data"
date: 2020-09-13T10:51:31+01:00
slug: ""
description: ""
keywords: ["scala","api","strongly-typed"]
draft: false
tags: ["scala","api","strongly-typed"]
math: false
toc: false
---


If you are interested in the correctness of your Web API, you should consider building a __strongly typed__ integration between the client and the server.

## Just the usual

In most cases, defining an API and using it can be quite prone to errors. 

Every Scala HTTP library has its own approach in building and defining endpoints, requests and responses which can become tedious in maintaining. 

Morever, there's no support to properly document the APIs, _this means that the documentation is manually defined which will eventually lead to integration errors_. 

However, the most important aspect is that there's _no compile-time guarantee_ that the requests are well-formed and that the client will correctly communicate with the server.

## Potential to improve

I recommend having a look at [Tapir](https://tapir.softwaremill.com/en/latest/) or [Endpoints4s](https://endpoints4s.github.io/). 

The benefits of using any of these libraries are immediate. It involves defining the endpoints as Scala immutable values, there's no code generation and one would only __define the API once and interpret it into a client, server and documentation__.

## Example using Tapir

Let the next class be our simple core model:
 ```scala
case class Appointment(
    email: String, 
    address: String,
    slot: String
)

 ```

#### API definition

 One requirement would be to build an API which defines the retrieving of an appointment by a given id:

 ```scala

val getAppointmentById = endpoint // Empty endpoint provided by Tapir
    .in("appointments") // Endpoint path
    .in(query[String]("id")) // Query parameter id
    .out(jsonBody[Appointment]) // Response body as json of Appointment
    .errorOut(
      oneOf[Error](
        statusMapping(StatusCode.NotFound, jsonBody[NotFound])
      )
    ) // Error response and status code mapping

 ```

 where our error is represented by a simple ADT:

 ```scala
sealed trait Error
case class NotFound(message: String) extends Error
 ```

Even without the additional comments the code is quite readable. We can easily notice what is supposed to go in the endpoint and out of it, as well as which errors are to be expected.


#### Server
Given the API definition, one could start building the web server in its preferred stack. (In this case [http4s](https://http4s.org/)).

```scala

val getAppointment: String => IO[Either[Error, Appointment]] =
  id => IO {
    Appointment
      .appointments
      .get(id)
      .toRight(NotFound("Appointment is not found"))
    
  }// Business logic to retrieve an appointment from some data source

val httpRoute: HttpRoutes[IO] = getAppointmentById.toRoutes(getAppointment)

```


#### Documentation

Similar to constructing the http route, building the documentation only implies creating an OpenAPI definition using Tapir and then building a route to represent the view of the documentation.

```scala
val docs: OpenAPI = getAppointmentById.toOpenAPI("My API", "1")
val docsRoute: HttpRoutes[IO] = new SwaggerHttp4s(docs.toYaml).routes
```

#### Swagger OpenAPI example

The output of the `docsRoute` can be accessed by default under `/docs` :
<br>

{{< figure src="/swagger-example-1.png" >}}


Where the API request/response definition is:

{{< figure src="/swagger-example-2.png" >}}



#### Client

On the client side, a function to create requests is built out of the endpoint definition. A request is obtained by applying the function to the given input, in this case an account Id. To send the request to the server use the [STTP client](https://tapir.softwaremill.com/en/latest/sttp.html).

```scala
val requestCreator = getAppointmentById.toSttpRequest(uri"http://server.host:8081")

val response = client.send(requestCreator("some-appointment-id"))
```

#### Recap

Out of a Scala case class which describes an endpoint, one can obtain a server, documentation and a client without any additional build steps or code generation and benefit from a compile-time checked integration between the client and the server.

Both [Tapir](https://tapir.softwaremill.com/en/latest/) and [Endpoints4s](https://endpoints4s.github.io/) are quite powerful and extensible. Both support multiple popular Scala HTTP libraries, such as [Akka](https://doc.akka.io/docs/akka-http/current/index.html), [http4s](https://http4s.org/) or [Finatra](https://twitter.github.io/finatra/).  

For the full example please see [demo](https://github.com/alexgb1/demo-http-api-as-data).