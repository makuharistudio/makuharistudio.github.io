// Rocket Launch Simulator — offline monthly wind climatology by country (no external APIs)
// Each country has 12 rows: month (1=Jan…12=Dec), surface wind speed (m/s), direction (°).
export const WEATHER = {
  "countries": {
    "United States": [
      {
        "month": 1,
        "speed": 8.5,
        "dir": 90
      },
      {
        "month": 2,
        "speed": 8.2,
        "dir": 98
      },
      {
        "month": 3,
        "speed": 7.5,
        "dir": 103
      },
      {
        "month": 4,
        "speed": 6.5,
        "dir": 105
      },
      {
        "month": 5,
        "speed": 5.5,
        "dir": 103
      },
      {
        "month": 6,
        "speed": 4.8,
        "dir": 98
      },
      {
        "month": 7,
        "speed": 4.5,
        "dir": 90
      },
      {
        "month": 8,
        "speed": 4.8,
        "dir": 82
      },
      {
        "month": 9,
        "speed": 5.5,
        "dir": 77
      },
      {
        "month": 10,
        "speed": 6.5,
        "dir": 75
      },
      {
        "month": 11,
        "speed": 7.5,
        "dir": 77
      },
      {
        "month": 12,
        "speed": 8.2,
        "dir": 82
      }
    ],
    "Russia": [
      {
        "month": 1,
        "speed": 12.0,
        "dir": 45
      },
      {
        "month": 2,
        "speed": 11.5,
        "dir": 51
      },
      {
        "month": 3,
        "speed": 10.0,
        "dir": 55
      },
      {
        "month": 4,
        "speed": 8.0,
        "dir": 57
      },
      {
        "month": 5,
        "speed": 10.0,
        "dir": 55
      },
      {
        "month": 6,
        "speed": 11.5,
        "dir": 51
      },
      {
        "month": 7,
        "speed": 12.0,
        "dir": 45
      },
      {
        "month": 8,
        "speed": 11.5,
        "dir": 39
      },
      {
        "month": 9,
        "speed": 10.0,
        "dir": 35
      },
      {
        "month": 10,
        "speed": 8.0,
        "dir": 33
      },
      {
        "month": 11,
        "speed": 10.0,
        "dir": 35
      },
      {
        "month": 12,
        "speed": 11.5,
        "dir": 39
      }
    ],
    "China": [
      {
        "month": 1,
        "speed": 8.5,
        "dir": 110
      },
      {
        "month": 2,
        "speed": 8.2,
        "dir": 119
      },
      {
        "month": 3,
        "speed": 7.2,
        "dir": 126
      },
      {
        "month": 4,
        "speed": 6.0,
        "dir": 128
      },
      {
        "month": 5,
        "speed": 7.2,
        "dir": 126
      },
      {
        "month": 6,
        "speed": 8.2,
        "dir": 119
      },
      {
        "month": 7,
        "speed": 8.5,
        "dir": 110
      },
      {
        "month": 8,
        "speed": 8.2,
        "dir": 101
      },
      {
        "month": 9,
        "speed": 7.3,
        "dir": 94
      },
      {
        "month": 10,
        "speed": 6.0,
        "dir": 92
      },
      {
        "month": 11,
        "speed": 7.2,
        "dir": 94
      },
      {
        "month": 12,
        "speed": 8.2,
        "dir": 101
      }
    ],
    "France": [
      {
        "month": 1,
        "speed": 6.0,
        "dir": 85
      },
      {
        "month": 2,
        "speed": 5.8,
        "dir": 89
      },
      {
        "month": 3,
        "speed": 5.2,
        "dir": 92
      },
      {
        "month": 4,
        "speed": 4.5,
        "dir": 93
      },
      {
        "month": 5,
        "speed": 5.2,
        "dir": 92
      },
      {
        "month": 6,
        "speed": 5.8,
        "dir": 89
      },
      {
        "month": 7,
        "speed": 6.0,
        "dir": 85
      },
      {
        "month": 8,
        "speed": 5.8,
        "dir": 81
      },
      {
        "month": 9,
        "speed": 5.2,
        "dir": 78
      },
      {
        "month": 10,
        "speed": 4.5,
        "dir": 77
      },
      {
        "month": 11,
        "speed": 5.2,
        "dir": 78
      },
      {
        "month": 12,
        "speed": 5.8,
        "dir": 81
      }
    ],
    "United Kingdom": [
      {
        "month": 1,
        "speed": 9.5,
        "dir": 250
      },
      {
        "month": 2,
        "speed": 9.2,
        "dir": 260
      },
      {
        "month": 3,
        "speed": 8.2,
        "dir": 267
      },
      {
        "month": 4,
        "speed": 7.0,
        "dir": 270
      },
      {
        "month": 5,
        "speed": 5.8,
        "dir": 267
      },
      {
        "month": 6,
        "speed": 4.8,
        "dir": 260
      },
      {
        "month": 7,
        "speed": 4.5,
        "dir": 250
      },
      {
        "month": 8,
        "speed": 4.8,
        "dir": 240
      },
      {
        "month": 9,
        "speed": 5.7,
        "dir": 233
      },
      {
        "month": 10,
        "speed": 7.0,
        "dir": 230
      },
      {
        "month": 11,
        "speed": 8.2,
        "dir": 233
      },
      {
        "month": 12,
        "speed": 9.2,
        "dir": 240
      }
    ],
    "Japan": [
      {
        "month": 1,
        "speed": 8.0,
        "dir": 95
      },
      {
        "month": 2,
        "speed": 7.7,
        "dir": 102
      },
      {
        "month": 3,
        "speed": 7.0,
        "dir": 108
      },
      {
        "month": 4,
        "speed": 6.0,
        "dir": 110
      },
      {
        "month": 5,
        "speed": 5.0,
        "dir": 108
      },
      {
        "month": 6,
        "speed": 4.3,
        "dir": 102
      },
      {
        "month": 7,
        "speed": 4.0,
        "dir": 95
      },
      {
        "month": 8,
        "speed": 4.3,
        "dir": 88
      },
      {
        "month": 9,
        "speed": 5.0,
        "dir": 82
      },
      {
        "month": 10,
        "speed": 6.0,
        "dir": 80
      },
      {
        "month": 11,
        "speed": 7.0,
        "dir": 82
      },
      {
        "month": 12,
        "speed": 7.7,
        "dir": 88
      }
    ],
    "India": [
      {
        "month": 1,
        "speed": 7.2,
        "dir": 250
      },
      {
        "month": 2,
        "speed": 8.5,
        "dir": 256
      },
      {
        "month": 3,
        "speed": 9.0,
        "dir": 260
      },
      {
        "month": 4,
        "speed": 8.5,
        "dir": 262
      },
      {
        "month": 5,
        "speed": 7.2,
        "dir": 260
      },
      {
        "month": 6,
        "speed": 5.5,
        "dir": 256
      },
      {
        "month": 7,
        "speed": 7.2,
        "dir": 250
      },
      {
        "month": 8,
        "speed": 8.5,
        "dir": 244
      },
      {
        "month": 9,
        "speed": 9.0,
        "dir": 240
      },
      {
        "month": 10,
        "speed": 8.5,
        "dir": 238
      },
      {
        "month": 11,
        "speed": 7.2,
        "dir": 240
      },
      {
        "month": 12,
        "speed": 5.5,
        "dir": 244
      }
    ],
    "Israel": [
      {
        "month": 1,
        "speed": 7.3,
        "dir": 280
      },
      {
        "month": 2,
        "speed": 7.1,
        "dir": 289
      },
      {
        "month": 3,
        "speed": 6.4,
        "dir": 296
      },
      {
        "month": 4,
        "speed": 5.5,
        "dir": 298
      },
      {
        "month": 5,
        "speed": 6.4,
        "dir": 296
      },
      {
        "month": 6,
        "speed": 7.1,
        "dir": 289
      },
      {
        "month": 7,
        "speed": 7.3,
        "dir": 280
      },
      {
        "month": 8,
        "speed": 7.1,
        "dir": 271
      },
      {
        "month": 9,
        "speed": 6.4,
        "dir": 264
      },
      {
        "month": 10,
        "speed": 5.5,
        "dir": 262
      },
      {
        "month": 11,
        "speed": 6.4,
        "dir": 264
      },
      {
        "month": 12,
        "speed": 7.1,
        "dir": 271
      }
    ],
    "Ukraine": [
      {
        "month": 1,
        "speed": 10.5,
        "dir": 50
      },
      {
        "month": 2,
        "speed": 10.0,
        "dir": 58
      },
      {
        "month": 3,
        "speed": 8.8,
        "dir": 63
      },
      {
        "month": 4,
        "speed": 7.0,
        "dir": 65
      },
      {
        "month": 5,
        "speed": 8.8,
        "dir": 63
      },
      {
        "month": 6,
        "speed": 10.0,
        "dir": 58
      },
      {
        "month": 7,
        "speed": 10.5,
        "dir": 50
      },
      {
        "month": 8,
        "speed": 10.0,
        "dir": 42
      },
      {
        "month": 9,
        "speed": 8.8,
        "dir": 37
      },
      {
        "month": 10,
        "speed": 7.0,
        "dir": 35
      },
      {
        "month": 11,
        "speed": 8.8,
        "dir": 37
      },
      {
        "month": 12,
        "speed": 10.0,
        "dir": 42
      }
    ],
    "Iran": [
      {
        "month": 1,
        "speed": 9.5,
        "dir": 310
      },
      {
        "month": 2,
        "speed": 9.2,
        "dir": 320
      },
      {
        "month": 3,
        "speed": 8.2,
        "dir": 327
      },
      {
        "month": 4,
        "speed": 7.0,
        "dir": 330
      },
      {
        "month": 5,
        "speed": 8.2,
        "dir": 327
      },
      {
        "month": 6,
        "speed": 9.2,
        "dir": 320
      },
      {
        "month": 7,
        "speed": 9.5,
        "dir": 310
      },
      {
        "month": 8,
        "speed": 9.2,
        "dir": 300
      },
      {
        "month": 9,
        "speed": 8.3,
        "dir": 293
      },
      {
        "month": 10,
        "speed": 7.0,
        "dir": 290
      },
      {
        "month": 11,
        "speed": 8.2,
        "dir": 293
      },
      {
        "month": 12,
        "speed": 9.2,
        "dir": 300
      }
    ],
    "North Korea": [
      {
        "month": 1,
        "speed": 7.5,
        "dir": 70
      },
      {
        "month": 2,
        "speed": 7.2,
        "dir": 76
      },
      {
        "month": 3,
        "speed": 6.5,
        "dir": 80
      },
      {
        "month": 4,
        "speed": 5.5,
        "dir": 82
      },
      {
        "month": 5,
        "speed": 4.5,
        "dir": 80
      },
      {
        "month": 6,
        "speed": 3.8,
        "dir": 76
      },
      {
        "month": 7,
        "speed": 3.5,
        "dir": 70
      },
      {
        "month": 8,
        "speed": 3.8,
        "dir": 64
      },
      {
        "month": 9,
        "speed": 4.5,
        "dir": 60
      },
      {
        "month": 10,
        "speed": 5.5,
        "dir": 58
      },
      {
        "month": 11,
        "speed": 6.5,
        "dir": 60
      },
      {
        "month": 12,
        "speed": 7.2,
        "dir": 64
      }
    ],
    "South Korea": [
      {
        "month": 1,
        "speed": 7.5,
        "dir": 70
      },
      {
        "month": 2,
        "speed": 7.2,
        "dir": 76
      },
      {
        "month": 3,
        "speed": 6.5,
        "dir": 80
      },
      {
        "month": 4,
        "speed": 5.5,
        "dir": 82
      },
      {
        "month": 5,
        "speed": 4.5,
        "dir": 80
      },
      {
        "month": 6,
        "speed": 3.8,
        "dir": 76
      },
      {
        "month": 7,
        "speed": 3.5,
        "dir": 70
      },
      {
        "month": 8,
        "speed": 3.8,
        "dir": 64
      },
      {
        "month": 9,
        "speed": 4.5,
        "dir": 60
      },
      {
        "month": 10,
        "speed": 5.5,
        "dir": 58
      },
      {
        "month": 11,
        "speed": 6.5,
        "dir": 60
      },
      {
        "month": 12,
        "speed": 7.2,
        "dir": 64
      }
    ],
    "Italy": [
      {
        "month": 1,
        "speed": 7.3,
        "dir": 200
      },
      {
        "month": 2,
        "speed": 7.1,
        "dir": 209
      },
      {
        "month": 3,
        "speed": 6.4,
        "dir": 216
      },
      {
        "month": 4,
        "speed": 5.5,
        "dir": 218
      },
      {
        "month": 5,
        "speed": 4.6,
        "dir": 216
      },
      {
        "month": 6,
        "speed": 3.9,
        "dir": 209
      },
      {
        "month": 7,
        "speed": 3.7,
        "dir": 200
      },
      {
        "month": 8,
        "speed": 3.9,
        "dir": 191
      },
      {
        "month": 9,
        "speed": 4.6,
        "dir": 184
      },
      {
        "month": 10,
        "speed": 5.5,
        "dir": 182
      },
      {
        "month": 11,
        "speed": 6.4,
        "dir": 184
      },
      {
        "month": 12,
        "speed": 7.1,
        "dir": 191
      }
    ],
    "New Zealand": [
      {
        "month": 1,
        "speed": 4.0,
        "dir": 220
      },
      {
        "month": 2,
        "speed": 4.3,
        "dir": 232
      },
      {
        "month": 3,
        "speed": 5.2,
        "dir": 242
      },
      {
        "month": 4,
        "speed": 6.5,
        "dir": 245
      },
      {
        "month": 5,
        "speed": 7.8,
        "dir": 242
      },
      {
        "month": 6,
        "speed": 8.7,
        "dir": 232
      },
      {
        "month": 7,
        "speed": 9.0,
        "dir": 220
      },
      {
        "month": 8,
        "speed": 8.7,
        "dir": 208
      },
      {
        "month": 9,
        "speed": 7.8,
        "dir": 198
      },
      {
        "month": 10,
        "speed": 6.5,
        "dir": 195
      },
      {
        "month": 11,
        "speed": 5.2,
        "dir": 198
      },
      {
        "month": 12,
        "speed": 4.3,
        "dir": 208
      }
    ],
    "Kazakhstan": [
      {
        "month": 1,
        "speed": 12.0,
        "dir": 45
      },
      {
        "month": 2,
        "speed": 11.5,
        "dir": 49
      },
      {
        "month": 3,
        "speed": 10.0,
        "dir": 52
      },
      {
        "month": 4,
        "speed": 8.0,
        "dir": 53
      },
      {
        "month": 5,
        "speed": 10.0,
        "dir": 52
      },
      {
        "month": 6,
        "speed": 11.5,
        "dir": 49
      },
      {
        "month": 7,
        "speed": 12.0,
        "dir": 45
      },
      {
        "month": 8,
        "speed": 11.5,
        "dir": 41
      },
      {
        "month": 9,
        "speed": 10.0,
        "dir": 38
      },
      {
        "month": 10,
        "speed": 8.0,
        "dir": 37
      },
      {
        "month": 11,
        "speed": 10.0,
        "dir": 38
      },
      {
        "month": 12,
        "speed": 11.5,
        "dir": 41
      }
    ],
    "Brazil": [
      {
        "month": 1,
        "speed": 7.0,
        "dir": 120
      },
      {
        "month": 2,
        "speed": 6.7,
        "dir": 128
      },
      {
        "month": 3,
        "speed": 6.0,
        "dir": 133
      },
      {
        "month": 4,
        "speed": 5.0,
        "dir": 135
      },
      {
        "month": 5,
        "speed": 6.0,
        "dir": 133
      },
      {
        "month": 6,
        "speed": 6.7,
        "dir": 128
      },
      {
        "month": 7,
        "speed": 7.0,
        "dir": 120
      },
      {
        "month": 8,
        "speed": 6.7,
        "dir": 112
      },
      {
        "month": 9,
        "speed": 6.0,
        "dir": 107
      },
      {
        "month": 10,
        "speed": 5.0,
        "dir": 105
      },
      {
        "month": 11,
        "speed": 6.0,
        "dir": 107
      },
      {
        "month": 12,
        "speed": 6.7,
        "dir": 112
      }
    ],
    "Australia": [
      {
        "month": 1,
        "speed": 3.2,
        "dir": 130
      },
      {
        "month": 2,
        "speed": 3.6,
        "dir": 139
      },
      {
        "month": 3,
        "speed": 4.4,
        "dir": 146
      },
      {
        "month": 4,
        "speed": 5.5,
        "dir": 148
      },
      {
        "month": 5,
        "speed": 6.6,
        "dir": 146
      },
      {
        "month": 6,
        "speed": 7.4,
        "dir": 139
      },
      {
        "month": 7,
        "speed": 7.8,
        "dir": 130
      },
      {
        "month": 8,
        "speed": 7.4,
        "dir": 121
      },
      {
        "month": 9,
        "speed": 6.6,
        "dir": 114
      },
      {
        "month": 10,
        "speed": 5.5,
        "dir": 112
      },
      {
        "month": 11,
        "speed": 4.4,
        "dir": 114
      },
      {
        "month": 12,
        "speed": 3.6,
        "dir": 121
      }
    ],
    "Sweden": [
      {
        "month": 1,
        "speed": 9.5,
        "dir": 40
      },
      {
        "month": 2,
        "speed": 9.2,
        "dir": 45
      },
      {
        "month": 3,
        "speed": 8.2,
        "dir": 49
      },
      {
        "month": 4,
        "speed": 7.0,
        "dir": 50
      },
      {
        "month": 5,
        "speed": 8.2,
        "dir": 49
      },
      {
        "month": 6,
        "speed": 9.2,
        "dir": 45
      },
      {
        "month": 7,
        "speed": 9.5,
        "dir": 40
      },
      {
        "month": 8,
        "speed": 9.2,
        "dir": 35
      },
      {
        "month": 9,
        "speed": 8.3,
        "dir": 31
      },
      {
        "month": 10,
        "speed": 7.0,
        "dir": 30
      },
      {
        "month": 11,
        "speed": 8.2,
        "dir": 31
      },
      {
        "month": 12,
        "speed": 9.2,
        "dir": 35
      }
    ],
    "Norway": [
      {
        "month": 1,
        "speed": 12.0,
        "dir": 30
      },
      {
        "month": 2,
        "speed": 11.6,
        "dir": 38
      },
      {
        "month": 3,
        "speed": 10.5,
        "dir": 43
      },
      {
        "month": 4,
        "speed": 9.0,
        "dir": 45
      },
      {
        "month": 5,
        "speed": 10.5,
        "dir": 43
      },
      {
        "month": 6,
        "speed": 11.6,
        "dir": 38
      },
      {
        "month": 7,
        "speed": 12.0,
        "dir": 30
      },
      {
        "month": 8,
        "speed": 11.6,
        "dir": 22
      },
      {
        "month": 9,
        "speed": 10.5,
        "dir": 17
      },
      {
        "month": 10,
        "speed": 9.0,
        "dir": 15
      },
      {
        "month": 11,
        "speed": 10.5,
        "dir": 17
      },
      {
        "month": 12,
        "speed": 11.6,
        "dir": 22
      }
    ],
    "Marshall Islands": [
      {
        "month": 1,
        "speed": 8.0,
        "dir": 75
      },
      {
        "month": 2,
        "speed": 9.0,
        "dir": 80
      },
      {
        "month": 3,
        "speed": 9.7,
        "dir": 84
      },
      {
        "month": 4,
        "speed": 10.0,
        "dir": 85
      },
      {
        "month": 5,
        "speed": 9.7,
        "dir": 84
      },
      {
        "month": 6,
        "speed": 9.0,
        "dir": 80
      },
      {
        "month": 7,
        "speed": 8.0,
        "dir": 75
      },
      {
        "month": 8,
        "speed": 9.0,
        "dir": 70
      },
      {
        "month": 9,
        "speed": 9.7,
        "dir": 66
      },
      {
        "month": 10,
        "speed": 10.0,
        "dir": 65
      },
      {
        "month": 11,
        "speed": 9.7,
        "dir": 66
      },
      {
        "month": 12,
        "speed": 9.0,
        "dir": 70
      }
    ],
    "Indonesia": [
      {
        "month": 1,
        "speed": 7.0,
        "dir": 110
      },
      {
        "month": 2,
        "speed": 6.7,
        "dir": 120
      },
      {
        "month": 3,
        "speed": 5.8,
        "dir": 127
      },
      {
        "month": 4,
        "speed": 4.5,
        "dir": 130
      },
      {
        "month": 5,
        "speed": 5.8,
        "dir": 127
      },
      {
        "month": 6,
        "speed": 6.7,
        "dir": 120
      },
      {
        "month": 7,
        "speed": 7.0,
        "dir": 110
      },
      {
        "month": 8,
        "speed": 6.7,
        "dir": 100
      },
      {
        "month": 9,
        "speed": 5.8,
        "dir": 93
      },
      {
        "month": 10,
        "speed": 4.5,
        "dir": 90
      },
      {
        "month": 11,
        "speed": 5.8,
        "dir": 93
      },
      {
        "month": 12,
        "speed": 6.7,
        "dir": 100
      }
    ],
    "Taiwan": [
      {
        "month": 1,
        "speed": 7.5,
        "dir": 60
      },
      {
        "month": 2,
        "speed": 8.6,
        "dir": 72
      },
      {
        "month": 3,
        "speed": 9.0,
        "dir": 82
      },
      {
        "month": 4,
        "speed": 8.6,
        "dir": 85
      },
      {
        "month": 5,
        "speed": 7.5,
        "dir": 82
      },
      {
        "month": 6,
        "speed": 6.0,
        "dir": 72
      },
      {
        "month": 7,
        "speed": 7.5,
        "dir": 60
      },
      {
        "month": 8,
        "speed": 8.6,
        "dir": 48
      },
      {
        "month": 9,
        "speed": 9.0,
        "dir": 38
      },
      {
        "month": 10,
        "speed": 8.6,
        "dir": 35
      },
      {
        "month": 11,
        "speed": 7.5,
        "dir": 38
      },
      {
        "month": 12,
        "speed": 6.0,
        "dir": 47
      }
    ],
    "T\u00fcrkiye": [
      {
        "month": 1,
        "speed": 8.0,
        "dir": 330
      },
      {
        "month": 2,
        "speed": 7.7,
        "dir": 339
      },
      {
        "month": 3,
        "speed": 7.0,
        "dir": 346
      },
      {
        "month": 4,
        "speed": 6.0,
        "dir": 348
      },
      {
        "month": 5,
        "speed": 7.0,
        "dir": 346
      },
      {
        "month": 6,
        "speed": 7.7,
        "dir": 339
      },
      {
        "month": 7,
        "speed": 8.0,
        "dir": 330
      },
      {
        "month": 8,
        "speed": 7.7,
        "dir": 321
      },
      {
        "month": 9,
        "speed": 7.0,
        "dir": 314
      },
      {
        "month": 10,
        "speed": 6.0,
        "dir": 312
      },
      {
        "month": 11,
        "speed": 7.0,
        "dir": 314
      },
      {
        "month": 12,
        "speed": 7.7,
        "dir": 321
      }
    ],
    "Saudi Arabia": [
      {
        "month": 1,
        "speed": 9.0,
        "dir": 320
      },
      {
        "month": 2,
        "speed": 8.7,
        "dir": 328
      },
      {
        "month": 3,
        "speed": 8.0,
        "dir": 333
      },
      {
        "month": 4,
        "speed": 7.0,
        "dir": 335
      },
      {
        "month": 5,
        "speed": 8.0,
        "dir": 333
      },
      {
        "month": 6,
        "speed": 8.7,
        "dir": 328
      },
      {
        "month": 7,
        "speed": 9.0,
        "dir": 320
      },
      {
        "month": 8,
        "speed": 8.7,
        "dir": 312
      },
      {
        "month": 9,
        "speed": 8.0,
        "dir": 307
      },
      {
        "month": 10,
        "speed": 7.0,
        "dir": 305
      },
      {
        "month": 11,
        "speed": 8.0,
        "dir": 307
      },
      {
        "month": 12,
        "speed": 8.7,
        "dir": 312
      }
    ],
    "United Arab Emirates": [
      {
        "month": 1,
        "speed": 8.3,
        "dir": 315
      },
      {
        "month": 2,
        "speed": 8.1,
        "dir": 321
      },
      {
        "month": 3,
        "speed": 7.4,
        "dir": 325
      },
      {
        "month": 4,
        "speed": 6.5,
        "dir": 327
      },
      {
        "month": 5,
        "speed": 7.4,
        "dir": 325
      },
      {
        "month": 6,
        "speed": 8.1,
        "dir": 321
      },
      {
        "month": 7,
        "speed": 8.3,
        "dir": 315
      },
      {
        "month": 8,
        "speed": 8.1,
        "dir": 309
      },
      {
        "month": 9,
        "speed": 7.4,
        "dir": 305
      },
      {
        "month": 10,
        "speed": 6.5,
        "dir": 303
      },
      {
        "month": 11,
        "speed": 7.4,
        "dir": 305
      },
      {
        "month": 12,
        "speed": 8.1,
        "dir": 309
      }
    ],
    "Canada": [
      {
        "month": 1,
        "speed": 10.0,
        "dir": 270
      },
      {
        "month": 2,
        "speed": 9.6,
        "dir": 282
      },
      {
        "month": 3,
        "speed": 8.5,
        "dir": 292
      },
      {
        "month": 4,
        "speed": 7.0,
        "dir": 295
      },
      {
        "month": 5,
        "speed": 5.5,
        "dir": 292
      },
      {
        "month": 6,
        "speed": 4.4,
        "dir": 282
      },
      {
        "month": 7,
        "speed": 4.0,
        "dir": 270
      },
      {
        "month": 8,
        "speed": 4.4,
        "dir": 258
      },
      {
        "month": 9,
        "speed": 5.5,
        "dir": 248
      },
      {
        "month": 10,
        "speed": 7.0,
        "dir": 245
      },
      {
        "month": 11,
        "speed": 8.5,
        "dir": 248
      },
      {
        "month": 12,
        "speed": 9.6,
        "dir": 258
      }
    ],
    "Argentina": [
      {
        "month": 1,
        "speed": 4.0,
        "dir": 200
      },
      {
        "month": 2,
        "speed": 4.4,
        "dir": 215
      },
      {
        "month": 3,
        "speed": 5.5,
        "dir": 226
      },
      {
        "month": 4,
        "speed": 7.0,
        "dir": 230
      },
      {
        "month": 5,
        "speed": 8.5,
        "dir": 226
      },
      {
        "month": 6,
        "speed": 9.6,
        "dir": 215
      },
      {
        "month": 7,
        "speed": 10.0,
        "dir": 200
      },
      {
        "month": 8,
        "speed": 9.6,
        "dir": 185
      },
      {
        "month": 9,
        "speed": 8.5,
        "dir": 174
      },
      {
        "month": 10,
        "speed": 7.0,
        "dir": 170
      },
      {
        "month": 11,
        "speed": 5.5,
        "dir": 174
      },
      {
        "month": 12,
        "speed": 4.4,
        "dir": 185
      }
    ],
    "Mexico": [
      {
        "month": 1,
        "speed": 7.5,
        "dir": 140
      },
      {
        "month": 2,
        "speed": 7.2,
        "dir": 150
      },
      {
        "month": 3,
        "speed": 6.5,
        "dir": 157
      },
      {
        "month": 4,
        "speed": 5.5,
        "dir": 160
      },
      {
        "month": 5,
        "speed": 4.5,
        "dir": 157
      },
      {
        "month": 6,
        "speed": 3.8,
        "dir": 150
      },
      {
        "month": 7,
        "speed": 3.5,
        "dir": 140
      },
      {
        "month": 8,
        "speed": 3.8,
        "dir": 130
      },
      {
        "month": 9,
        "speed": 4.5,
        "dir": 123
      },
      {
        "month": 10,
        "speed": 5.5,
        "dir": 120
      },
      {
        "month": 11,
        "speed": 6.5,
        "dir": 123
      },
      {
        "month": 12,
        "speed": 7.2,
        "dir": 130
      }
    ],
    "South Africa": [
      {
        "month": 1,
        "speed": 3.5,
        "dir": 180
      },
      {
        "month": 2,
        "speed": 3.8,
        "dir": 190
      },
      {
        "month": 3,
        "speed": 4.8,
        "dir": 197
      },
      {
        "month": 4,
        "speed": 6.0,
        "dir": 200
      },
      {
        "month": 5,
        "speed": 7.2,
        "dir": 197
      },
      {
        "month": 6,
        "speed": 8.2,
        "dir": 190
      },
      {
        "month": 7,
        "speed": 8.5,
        "dir": 180
      },
      {
        "month": 8,
        "speed": 8.2,
        "dir": 170
      },
      {
        "month": 9,
        "speed": 7.3,
        "dir": 163
      },
      {
        "month": 10,
        "speed": 6.0,
        "dir": 160
      },
      {
        "month": 11,
        "speed": 4.8,
        "dir": 163
      },
      {
        "month": 12,
        "speed": 3.8,
        "dir": 170
      }
    ],
    "Spain": [
      {
        "month": 1,
        "speed": 7.5,
        "dir": 270
      },
      {
        "month": 2,
        "speed": 7.2,
        "dir": 279
      },
      {
        "month": 3,
        "speed": 6.5,
        "dir": 286
      },
      {
        "month": 4,
        "speed": 5.5,
        "dir": 288
      },
      {
        "month": 5,
        "speed": 6.5,
        "dir": 286
      },
      {
        "month": 6,
        "speed": 7.2,
        "dir": 279
      },
      {
        "month": 7,
        "speed": 7.5,
        "dir": 270
      },
      {
        "month": 8,
        "speed": 7.2,
        "dir": 261
      },
      {
        "month": 9,
        "speed": 6.5,
        "dir": 254
      },
      {
        "month": 10,
        "speed": 5.5,
        "dir": 252
      },
      {
        "month": 11,
        "speed": 6.5,
        "dir": 254
      },
      {
        "month": 12,
        "speed": 7.2,
        "dir": 261
      }
    ],
    "Egypt": [
      {
        "month": 1,
        "speed": 9.0,
        "dir": 40
      },
      {
        "month": 2,
        "speed": 8.7,
        "dir": 48
      },
      {
        "month": 3,
        "speed": 7.8,
        "dir": 53
      },
      {
        "month": 4,
        "speed": 6.5,
        "dir": 55
      },
      {
        "month": 5,
        "speed": 7.8,
        "dir": 53
      },
      {
        "month": 6,
        "speed": 8.7,
        "dir": 48
      },
      {
        "month": 7,
        "speed": 9.0,
        "dir": 40
      },
      {
        "month": 8,
        "speed": 8.7,
        "dir": 32
      },
      {
        "month": 9,
        "speed": 7.8,
        "dir": 27
      },
      {
        "month": 10,
        "speed": 6.5,
        "dir": 25
      },
      {
        "month": 11,
        "speed": 7.8,
        "dir": 27
      },
      {
        "month": 12,
        "speed": 8.7,
        "dir": 32
      }
    ],
    "Poland": [
      {
        "month": 1,
        "speed": 9.0,
        "dir": 60
      },
      {
        "month": 2,
        "speed": 8.7,
        "dir": 68
      },
      {
        "month": 3,
        "speed": 7.8,
        "dir": 73
      },
      {
        "month": 4,
        "speed": 6.5,
        "dir": 75
      },
      {
        "month": 5,
        "speed": 5.2,
        "dir": 73
      },
      {
        "month": 6,
        "speed": 4.3,
        "dir": 68
      },
      {
        "month": 7,
        "speed": 4.0,
        "dir": 60
      },
      {
        "month": 8,
        "speed": 4.3,
        "dir": 52
      },
      {
        "month": 9,
        "speed": 5.2,
        "dir": 47
      },
      {
        "month": 10,
        "speed": 6.5,
        "dir": 45
      },
      {
        "month": 11,
        "speed": 7.8,
        "dir": 47
      },
      {
        "month": 12,
        "speed": 8.7,
        "dir": 52
      }
    ],
    "Romania": [
      {
        "month": 1,
        "speed": 8.5,
        "dir": 55
      },
      {
        "month": 2,
        "speed": 8.2,
        "dir": 61
      },
      {
        "month": 3,
        "speed": 7.2,
        "dir": 65
      },
      {
        "month": 4,
        "speed": 6.0,
        "dir": 67
      },
      {
        "month": 5,
        "speed": 7.2,
        "dir": 65
      },
      {
        "month": 6,
        "speed": 8.2,
        "dir": 61
      },
      {
        "month": 7,
        "speed": 8.5,
        "dir": 55
      },
      {
        "month": 8,
        "speed": 8.2,
        "dir": 49
      },
      {
        "month": 9,
        "speed": 7.3,
        "dir": 45
      },
      {
        "month": 10,
        "speed": 6.0,
        "dir": 43
      },
      {
        "month": 11,
        "speed": 7.2,
        "dir": 45
      },
      {
        "month": 12,
        "speed": 8.2,
        "dir": 49
      }
    ],
    "Germany": [
      {
        "month": 1,
        "speed": 8.0,
        "dir": 240
      },
      {
        "month": 2,
        "speed": 7.7,
        "dir": 250
      },
      {
        "month": 3,
        "speed": 7.0,
        "dir": 257
      },
      {
        "month": 4,
        "speed": 6.0,
        "dir": 260
      },
      {
        "month": 5,
        "speed": 5.0,
        "dir": 257
      },
      {
        "month": 6,
        "speed": 4.3,
        "dir": 250
      },
      {
        "month": 7,
        "speed": 4.0,
        "dir": 240
      },
      {
        "month": 8,
        "speed": 4.3,
        "dir": 230
      },
      {
        "month": 9,
        "speed": 5.0,
        "dir": 223
      },
      {
        "month": 10,
        "speed": 6.0,
        "dir": 220
      },
      {
        "month": 11,
        "speed": 7.0,
        "dir": 223
      },
      {
        "month": 12,
        "speed": 7.7,
        "dir": 230
      }
    ]
  }
};
