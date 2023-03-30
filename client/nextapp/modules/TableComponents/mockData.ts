import { FlightSchemaTable } from "@schema/FlightSchema"

export const flightData2 = [
    {

        startTime: 'test value',

        temperature: 339,
        flightId: 1,
        planeId: 1,
        pilot: 'Max Mustermann',
        averageSpeed: 33838,
        longitude: 290.93,
        latitude: 320.32,
        notes: "Mission Impossible",
        createdAt: '2017-02-12T12:00:00-06:30',
        missionId: "3994",
        observer: 28383







    },

    {
        //date: format(

        startTime: '2017-03-24T12:00:00-06:30',
        // 'D-MM-YYYY'),
        //  startTime: '23rd July 2022',
        temperature: 3039,
        planeId: 2,
        flightId: 2,
        pilot: 'Jane Musterfrau',
        averageSpeed: 3993,
        longitude: 234.83,
        latitude: 34.26,
        notes: "Adler",
        createdAt: "",
        missionId: "3993"
    },

    {
        //date: format(

        startTime: '2017-04-01T12:00:00-06:30',
        // 'D-MM-YYYY'),
        //  startTime: '23rd July 2022',
        temperature: 874,
        flightId: 3,
        planeId: 2,
        pilot: 'Peter Holzkopf',
        averageSpeed: 928,
        longitude: 39.37,
        latitude: 203.48,
        notes: "Falcon",
        createdAt: ""
    },

    {
        //date: format(

        startTime: '2017-02-12T12:00:00-06:30',
        // 'D-MM-YYYY'),
        //  startTime: '23rd July 2022',
        temperature: 874,
        flightId: 4,
        planeId: 4,
        pilot: 'Peter Holzkopf',
        averageSpeed: 928,
        longitude: 202.37,
        latitude: 12.01,
        notes: "",
        createdAt: ""
    },
    {
        //date: format(

        startTime: '2018-08-10T12:00:00-06:30',
        // 'D-MM-YYYY'),
        //  startTime: '23rd July 2022',
        temperature: 1033,
        flightId: 5,
        planeId: 7,
        pilot: 'Ute Müller',
        averageSpeed: 453,
        longitude: 129.37,
        latitude: 54.01,
        notes: "233",
        missionId: "3995"

    },
    {
        //date: format(

        startTime: '2018-08-11T12:00:00-06:30',
        // 'D-MM-YYYY'),
        //  startTime: '01 August 2022',
        temperature: 339,
        flightId: 6,
        planeId: 1,
        pilot: 'Max Mustermann',
        averageSpeed: 33838,
        longitude: 90.37,
        latitude: 52.01,
        notes: "",
        createdAt: "",
        missionId: '3992',
    },

    {
        //date: format(

        startTime: '2017-01-03T12:00:00-06:30',
        // 'D-MM-YYYY'),
        //  startTime: '23rd July 2022',
        temperature: 3039,
        planeId: 2,
        flightId: 7,
        pilot: 'Jane Musterfrau',
        averageSpeed: 3993,
        longitude: 2.37,
        latitude: 202.01,
        notes: "",
        createdAt: ""

    },

    {
        //date: format(

        startTime: '2018-10-01T12:00:00-06:30',
        // 'D-MM-YYYY'),
        //  startTime: '23rd July 2022',
        temperature: 874,
        flightId: 8,
        planeId: 2,
        pilot: 'Peter Holzkopf',
        averageSpeed: 928,
        longitude: 10.37,
        latitude: 89.01,
        notes: "",
        createdAt: ""
    },

    {
        //date: format(

        startTime: '2018-12-18T12:00:00-06:30',
        // 'D-MM-YYYY'),
        //  startTime: '23rd July 2022',
        temperature: 874,
        flightId: 9,
        planeId: 4,
        pilot: 'Peter Holzkopf',
        averageSpeed: 928,
        longitude: 20.37,
        latitude: 10.01,
        notes: "",
        createdAt: ""

    },
    {
        //date: format(

        startTime: '2018-07-01T12:00:00-06:30',
        // 'D-MM-YYYY'),
        //  startTime: '23rd July 2022',
        temperature: 1033,
        flightId: 10,
        planeId: 7,
        pilot: 'Ute Müller',
        averageSpeed: 453,
        longitude: 90.37,
        latitude: 102.01,
        notes: "",
        createdAt: ""

    },
    {
        //date: format(

        startTime: '2019-05-11T12:00:00-06:30',
        // 'D-MM-YYYY'),
        //  startTime: '23rd July 2022',
        temperature: 874,
        flightId: 11,
        planeId: 2,
        pilot: 'Peter Holzkopf',
        averageSpeed: 928,
        longitude: 100.20,
        latitude: 76.01,
        notes: "",
        createdAt: ""

    },

    {
        //date: format(

        startTime: '2018-01-04T12:00:00-06:30',
        // 'D-MM-YYYY'),
        //  startTime: '23rd July 2022',
        temperature: 874,
        flightId: 12,
        planeId: 4,
        pilot: 'Peter Holzkopf',
        averageSpeed: 928,
        longitude: 89.20,
        latitude: 25.01,
        notes: "",
        createdAt: ""


    },
    {
        //date: format(

        startTime: '2017-10-06T12:00:00-06:30',
        // 'D-MM-YYYY'),
        //  startTime: '23rd July 2022',
        temperature: 1033,
        flightId: 13,
        planeId: 7,
        pilot: 'Ute Müller',
        averageSpeed: 453,
        longitude: 49.20,
        latitude: 24.01,
        notes: "",
        createdAt: ""
    },
]


export const flightData: FlightSchemaTable[] = [


    {
        //actual columns
        flightId: "123",
        description: "test",
        pilot: "Max Mustermann",
        location: "La Reunion",
        rating: "good",
        droneNeedsRepair: false,
        planeId: "3",
        purpose: "test",
        missionId: "3991",
        notes: "",


        //weather api

        temperature: 30,
        weatherConditions: ["Sunny", "Rainy"],

        //from log
        startTime: '2017-02-12T12:00:00-06:30',
        createdAt: '2017-02-12T12:00:00-06:30',
        energyConsumed: 234,//Wh
        minPower: 34,//W
        maxPower: 3,//W
        avgPower: 453,//W
        minBatVoltage: 3,//V
        maxBatVoltage: 42404,//V
        avgBatVoltage: 4494,//V
        deltaBatVoltage: 4984,//V
        minBatCurrent: 2,//A
        maxBatCurrent: 4,//A
        avgBatCurrent: 53,//A
        minGroundSpeed: 342,//km/h
        maxGroundSpeed: 344,//km/h
        avgGroundSpeed: 43,//km/h
        minAirSpeed: 244,//km/h
        maxAirSpeed: 73,//km/h
        avgAirSpeed: 53,//km/h
        avgWindSpeed: 543,//km/h

        maxSpeedUp: 234,//km/h
        maxSpeedDown: 234, //km/h
        maxSpeedHorizontal: 233, //km/h

        maxTelemetaryDistance: 43,  //km
        flightDuration: 42, //hh:mm:ss
        logDuration: 2,//hh:mm:ss
        totalDistance: 466, //km
        hardwareVersion: "some version",
        firmwareVersion: "some firmware",
    },

    {
        //actual columns
        flightId: "124",
        description: "test",
        pilot: "Max Mustermann",
        location: "La Reunion",
        rating: "good",
        droneNeedsRepair: false,
        planeId: "3",
        purpose: "test",
        missionId: "3991",
        notes: "",


        //weather api

        temperature: 30,
        weatherConditions: ["Sunny", "Rainy"],

        //from log
        startTime: '2017-02-12T12:00:00-06:30',
        createdAt: '2017-02-12T12:00:00-06:30',
        energyConsumed: 234,//Wh
        minPower: 34,//W
        maxPower: 3,//W
        avgPower: 453,//W
        minBatVoltage: 3,//V
        maxBatVoltage: 42404,//V
        avgBatVoltage: 4494,//V
        deltaBatVoltage: 4984,//V
        minBatCurrent: 2,//A
        maxBatCurrent: 4,//A
        avgBatCurrent: 53,//A
        minGroundSpeed: 342,//km/h
        maxGroundSpeed: 344,//km/h
        avgGroundSpeed: 43,//km/h
        minAirSpeed: 244,//km/h
        maxAirSpeed: 73,//km/h
        avgAirSpeed: 53,//km/h
        avgWindSpeed: 543,//km/h

        maxSpeedUp: 234,//km/h
        maxSpeedDown: 234, //km/h
        maxSpeedHorizontal: 233, //km/h

        maxTelemetaryDistance: 43,  //km
        flightDuration: 42, //hh:mm:ss
        logDuration: 2,//hh:mm:ss
        totalDistance: 466, //km
        hardwareVersion: "some version",
        firmwareVersion: "some firmware",
    },

    {
        //actual columns
        flightId: "125",
        description: "test",
        pilot: "Max Mustermann",
        location: "La Reunion",
        rating: "good",
        droneNeedsRepair: false,
        planeId: "3",
        purpose: "test",
        missionId: "3991",
        notes: "",


        //weather api

        temperature: 30,
        weatherConditions: ["Sunny", "Rainy"],

        //from log
        startTime: '2017-02-12T12:00:00-06:30',
        createdAt: '2017-02-12T12:00:00-06:30',
        energyConsumed: 234,//Wh
        minPower: 34,//W
        maxPower: 3,//W
        avgPower: 453,//W
        minBatVoltage: 3,//V
        maxBatVoltage: 42404,//V
        avgBatVoltage: 4494,//V
        deltaBatVoltage: 4984,//V
        minBatCurrent: 2,//A
        maxBatCurrent: 4,//A
        avgBatCurrent: 53,//A
        minGroundSpeed: 342,//km/h
        maxGroundSpeed: 344,//km/h
        avgGroundSpeed: 43,//km/h
        minAirSpeed: 244,//km/h
        maxAirSpeed: 73,//km/h
        avgAirSpeed: 53,//km/h
        avgWindSpeed: 543,//km/h

        maxSpeedUp: 234,//km/h
        maxSpeedDown: 234, //km/h
        maxSpeedHorizontal: 233, //km/h

        maxTelemetaryDistance: 43,  //km
        flightDuration: 42, //hh:mm:ss
        logDuration: 2,//hh:mm:ss
        totalDistance: 466, //km
        hardwareVersion: "some version",
        firmwareVersion: "some firmware",
    }
]





export const missionData = [
    {
        longitude: 290.93,
        latitude: 320.32,
        missionAlias: "Falcon",
        isTest: true,
        description: "some mission",
        location: "Germany",
        missionId: "3991"

    },
    {

        longitude: 234.83,
        latitude: 34.26,
        missionAlias: "Mission impossible",
        isTest: true,
        description: "some mission",
        location: "Germany",
        missionId: "3992"
    },
    {

        longitude: 39.37,
        latitude: 203.48,
        missionAlias: "Bear",
        isTest: true,
        description: "some mission",
        location: "Italy",
        missionId: "3993"
    },

    {
        longitude: 202.37,
        latitude: 12.01,
        missionAlias: "1",
        isTest: true,
        description: "some mission",

        location: "Spain",
        missionId: "3994"

    },
    {

        longitude: 129.37,
        latitude: 54.01,
        missionAlias: "2 33",
        isTest: true,
        description: "some mission",
        location: "Germany",
        missionId: "3995"

    },
    {

        longitude: 90.37,
        latitude: 52.01,
        missionAlias: "A",
        description: "some mission",
        isTest: true,
        location: "Germany",
        missionId: "3996"

    },

    {

        longitude: 2.37,
        latitude: 202.01,
        missionAlias: "B",
        description: "some mission",
        isTest: true,
        location: "Germany",
        missionId: "3997"

    },

    {

        longitude: 10.37,
        latitude: 89.01,
        missionAlias: "C",
        description: "some mission",
        isTest: true,
        location: "France",
        missionId: "3998"

    },

    {

        longitude: 20.37,
        latitude: 10.01,
        missionAlias: "D",
        description: "some mission",
        isTest: true,
        location: "Portugal",
        missionId: "3999"
    },
    {

        longitude: 90.37,
        latitude: 102.01,
        missionAlias: "E",
        description: "some mission",
        isTest: true,
        location: "Germany",
        missionId: "3910"
    },
    {

        longitude: 100.20,
        latitude: 76.01,
        missionAlias: "F",
        description: "some mission",
        isTest: true,
        location: "Germany",
        missionId: "3911"
    },

    {
        longitude: 89.20,
        latitude: 25.01,
        missionAlias: "G",
        description: "some mission",
        isTest: true,
        location: "Germany",
        missionId: "3912"
    },
    {

        longitude: 49.20,
        latitude: 24.01,
        missionAlias: "H",
        description: "some mission",
        isTest: true,
        location: "Germany",
        missionId: "3913"
    }
]