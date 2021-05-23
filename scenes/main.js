const WALL_SIZE = 50
const HALF_WALL_SIZE = WALL_SIZE * 0.5

const wallComponents = [
  origin('center'),
  solid()
]

const leftWall = add([
  ...wallComponents,
  'sideWall',
  rect(WALL_SIZE, height()),
  pos(-HALF_WALL_SIZE, height() * 0.5),
])

const rightWall = add([
  ...wallComponents,
  'sideWall',
  rect(WALL_SIZE, height()),
  pos(width() + HALF_WALL_SIZE, height() * 0.5),
])

const topwall = add([
  ...wallComponents,
  'topWall',
  rect(width(), WALL_SIZE),
  pos(width() * 0.5, -HALF_WALL_SIZE)
])

addLevel(
  [
    '         ',
    '         ',
    '         ',
    '  rgbpyr ',
    '  rgbpyr ',
    '  rgbpyr ',
    '         ',
    '         ',
    '         ',
  ],
  {
    // cell width and height
    width: 64,
    height: 32,
    // map 
    'r': [
      'brick',
      sprite('element_red_rectangle'),
      origin('center'),
      solid()
    ],
    'g': [
      'brick',
      sprite('element_green_rectangle'),
      origin('center'),
      solid()
    ],
    'b': [
      'brick',
      sprite('element_blue_rectangle'),
      origin('center'),
      solid()
    ],
    'p': [
      'brick',
      sprite('element_purple_rectangle'),
      origin('center'),
      solid()
    ],
    'y': [
      'brick',
      sprite('element_yellow_rectangle'),
      origin('center'),
      solid()
    ]
  }
)

const ball = add([
  'ball',
  sprite('ballGrey'),
  origin('center'),
  pos(width() * 0.5, height() - 100),
  {
    velocity: vec2(-1, -1),
    speed: 300
  }
])

const paddle = add([
  'paddle',
  rect(100, 25),
  pos(width() * 0.5, height() - 50),
  origin('center'),
  solid()
])

ball.action(() => {
  const { speed, velocity } = ball
  ball.move(velocity.x * speed, velocity.y * speed)
  ball.resolve()

  if (ball.pos.y > height() + 50)
  {
    // reset
    ball.pos.x = width() * 0.5
    ball.pos.y = height() - 100
    ball.velocity.y = -1
  }
})

const calcReflection = (vel, normal) => {
  const dot = vel.x * normal.x + vel.y * normal.y
  return normal.scale(dot * -2)
}

collides('sideWall', 'ball', (wall, ball) => {
  const vel = ball.velocity
  const normal = wall.pos.x < ball.pos.x
    ? vec2(1, 0)
    : vec2(-1, 0)

  const vec = calcReflection(vel, normal)

  ball.velocity.x += vec.x
  ball.velocity.y += vec.y
})

collides('topWall', 'ball', (wall, ball) => {
  const vel = ball.velocity
  const normal = vec2(0, 1)

  const vec = calcReflection(vel, normal)

  ball.velocity.x += vec.x
  ball.velocity.y += vec.y
})

let collided = false
collides('brick', 'ball', (brick, ball) => {
  if (collided)
  {
    return
  }

  // next tick to prevent double collisions in
  // a single frame
  collided = true
  setTimeout(() => {
    collided = false
  }, 0)

  // poor man's "good enough" physics
  let normal = vec2(0, 0)
  if (ball.pos.x > brick.pos.x - 38
    && ball.pos.x < brick.pos.x + 38
  )
  {
    // top or bottom
    if (ball.pos.y < brick.pos.y)
    {
      // top
      normal.x = 0
      normal.y = -1
    }
    else if (ball.pos.y > brick.pos.y)
    {
      // bottom
      normal.x = 0
      normal.y = 1
    }
  }
  else if (ball.pos.x < brick.pos.x)
  {
    // left
    normal.x = -1
    normal.y = 0
  }
  else
  {
    // right
    normal.x = 1
    normal.y = 0
  }

  destroy(brick)

  const vel = ball.velocity
  const vec = calcReflection(vel, normal)

  ball.velocity.x += vec.x
  ball.velocity.y += vec.y
})

collides('paddle', 'ball', (paddle, ball) => {
  const normal = ball.pos.y < paddle.pos.y
    ? vec2(0, -1)
    : vec2(0, 1)

  const vel = ball.velocity
  const vec = calcReflection(vel, normal)

  ball.velocity.x += vec.x
  ball.velocity.y += vec.y
})

keyDown('left', () => {
  paddle.pos.x -= 8
})

keyDown('right', () => {
  paddle.pos.x += 8
})
