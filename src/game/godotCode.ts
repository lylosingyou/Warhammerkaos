export interface GodotFile {
  filename: string;
  category: 'core' | 'units' | 'system' | 'project';
  description: string;
  code: string;
}

export const GODOT4_PROJECT_FILES: GodotFile[] = [
  {
    filename: 'project.godot',
    category: 'project',
    description: 'Godot 4 Project Settings (160x144 viewport, 5x stretch, 2D pixel snap)',
    code: `; Engine configuration file for Warhammer 40k GameBoy Tactics
; Compatible with Godot 4.2+ / 4.3+

config_version=5

[application]
config/name="Warhammer 40K 8-Bit Tactics (GameBoy DMG)"
run/main_scene="res://scenes/Main.tscn"
config/features=PackedStringArray("4.3", "Forward Plus")

[display]
window/size/viewport_width=160
window/size/viewport_height=144
window/size/window_width_override=800
window/size/window_height_override=720
window/stretch/mode="viewport"
window/stretch/aspect="keep"

[rendering]
textures/canvas_textures/default_texture_filter=0
2d/snap/snap_2d_transforms_to_pixel=true
2d/snap/snap_2d_vertices_to_pixel=true
`
  },
  {
    filename: 'GameManager.gd',
    category: 'core',
    description: 'Global Game Manager, Turn Tick Timer (3s), Win/Loss conditions',
    code: `extends Node2D
class_name GameManager

# Turn tick every 3 seconds
const TURN_TICK_TIME: float = 3.0
var turn_timer: float = 3.0
var turn_count: int = 0

@onready var grid_map: TileMap = $GridMap
@onready var camera: Camera2D = $Camera2D

var player_marines: Array[Node2D] = []
var enemy_units: Array[Node2D] = []
var active_marine: Node2D = null

signal turn_ticked(current_turn: int)
signal game_won
signal game_lost

func _ready() -> void:
	refresh_unit_lists()
	if player_marines.size() > 0:
		select_marine(player_marines[0])

func _process(delta: float) -> void:
	# 3-Second Turn Tick Timer
	turn_timer -= delta
	if turn_timer <= 0.0:
		turn_timer = TURN_TICK_TIME
		turn_count += 1
		emit_signal("turn_ticked", turn_count)
		_on_global_turn_tick()

	# Smooth camera follow active marine
	if active_marine and is_instance_valid(active_marine):
		camera.position = camera.position.lerp(active_marine.position, 0.1)

func _on_global_turn_tick() -> void:
	# Notify all Tyranid eggs & units
	get_tree().call_group("tyranids", "on_turn_tick")
	get_tree().call_group("eggs", "on_turn_tick")

func select_marine(marine: Node2D) -> void:
	active_marine = marine
	for m in player_marines:
		if is_instance_valid(m):
			m.set_selected(m == marine)

func check_win_loss() -> void:
	refresh_unit_lists()
	if player_marines.size() == 0:
		emit_signal("game_lost")
		print("DEFEAT: All Space Marines were wiped out!")
	elif enemy_units.size() == 0:
		emit_signal("game_won")
		print("VICTORY: All Xenos & Bio-Eggs purged for the Emperor!")

func refresh_unit_lists() -> void:
	player_marines = get_tree().get_nodes_in_group("marines")
	enemy_units = get_tree().get_nodes_in_group("enemies")
`
  },
  {
    filename: 'PlayerMarine.gd',
    category: 'units',
    description: 'Space Marine Controller (HP: 5, ATK: 2, 4-dir move, 8-dir shoot, 3x3 Grenade)',
    code: `extends CharacterBody2D
class_name PlayerMarine

const TILE_SIZE: int = 16
var max_hp: int = 5
var hp: int = 5
var atk: int = 2
var move_speed: float = 64.0 # Pixels per sec

# Abilities
var grenade_cooldown_max: float = 7.0
var grenade_cooldown: float = 0.0

var grid_pos: Vector2i = Vector2i.ZERO
var target_pos: Vector2 = Vector2.ZERO
var is_moving: bool = false
var is_selected: bool = false
var facing: Vector2 = Vector2.DOWN
var aim_dir: Vector2 = Vector2.DOWN

@onready var anim_sprite: AnimatedSprite2D = $AnimatedSprite2D
@onready var grenade_scene: PackedScene = preload("res://scenes/Grenade.tscn")
@onready var bolter_scene: PackedScene = preload("res://scenes/BolterShot.tscn")

func _ready() -> void:
	add_to_group("marines")
	grid_pos = Vector2i(int(position.x / TILE_SIZE), int(position.y / TILE_SIZE))
	position = Vector2(grid_pos * TILE_SIZE)

func _process(delta: float) -> void:
	if grenade_cooldown > 0.0:
		grenade_cooldown = max(0.0, grenade_cooldown - delta)

	if is_moving:
		position = position.move_toward(target_pos, move_speed * delta)
		if position.distance_to(target_pos) < 0.5:
			position = target_pos
			is_moving = false

func _unhandled_input(event: InputEvent) -> void:
	if not is_selected or is_moving:
		return

	# 4-Direction Grid Movement (WASD / D-Pad)
	var move_input = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
	if move_input != Vector2.ZERO:
		if abs(move_input.x) > abs(move_input.y):
			try_move(Vector2i(sign(move_input.x), 0))
		else:
			try_move(Vector2i(0, sign(move_input.y)))

	# 8-Direction Aim & Bolter Shoot (Action A / Space)
	if Input.is_action_just_pressed("ui_accept"):
		shoot_bolter(aim_dir)

	# Frag Grenade 3x3 AoE (Action B / Key X)
	if Input.is_action_just_pressed("ability_grenade") and grenade_cooldown <= 0:
		launch_grenade(grid_pos + Vector2i(aim_dir) * 3)

func try_move(dir: Vector2i) -> void:
	facing = Vector2(dir)
	aim_dir = Vector2(dir)
	var next_grid = grid_pos + dir
	# Check collision with tilemap or units
	if get_parent().is_tile_walkable(next_grid):
		grid_pos = next_grid
		target_pos = Vector2(grid_pos * TILE_SIZE)
		is_moving = true

func shoot_bolter(dir: Vector2) -> void:
	var shot = bolter_scene.instantiate()
	shot.position = position + Vector2(8, 8)
	shot.direction = dir.normalized()
	shot.damage = atk
	get_parent().add_child(shot)

func launch_grenade(target_grid: Vector2i) -> void:
	grenade_cooldown = grenade_cooldown_max
	var grenade = grenade_scene.instantiate()
	grenade.position = position + Vector2(8, 8)
	grenade.target_pixel = Vector2(target_grid * TILE_SIZE) + Vector2(8, 8)
	grenade.damage = 3
	grenade.aoe_radius = 1 # 3x3
	get_parent().add_child(grenade)

func take_damage(dmg: int) -> void:
	hp -= dmg
	if hp <= 0:
		queue_free()
		get_parent().check_win_loss()
`
  },
  {
    filename: 'Ork.gd',
    category: 'units',
    description: 'Ork Boy Enemy (HP: 4, ATK: 2, Ability: WAAAGH! Rush 3 tiles)',
    code: `extends CharacterBody2D
class_name OrkBoy

const TILE_SIZE: int = 16
var max_hp: int = 4
var hp: int = 4
var atk: int = 2
var rush_cooldown: float = 6.0

var grid_pos: Vector2i = Vector2i.ZERO
var target_pos: Vector2 = Vector2.ZERO
var is_moving: bool = false
var is_rushing: bool = false

func _ready() -> void:
	add_to_group("enemies")
	grid_pos = Vector2i(int(position.x / TILE_SIZE), int(position.y / TILE_SIZE))

func _process(delta: float) -> void:
	if rush_cooldown > 0.0:
		rush_cooldown = max(0.0, rush_cooldown - delta)

func perform_rush(direction: Vector2i) -> void:
	rush_cooldown = 6.0
	is_rushing = true
	# Rush 3 tiles forward in straight line
	for step in range(1, 4):
		var check_grid = grid_pos + direction * step
		var target_marine = get_parent().get_marine_at(check_grid)
		if target_marine:
			target_marine.take_damage(2) # 2 DMG on path impact
			break
		grid_pos = check_grid

	target_pos = Vector2(grid_pos * TILE_SIZE)
	is_moving = true

func take_damage(dmg: int) -> void:
	hp -= dmg
	if hp <= 0:
		queue_free()
		get_parent().check_win_loss()
`
  },
  {
    filename: 'Tyranid.gd',
    category: 'units',
    description: 'Tyranid Gaunt & Egg System (HP: 3, ATK: 1, Lays egg every 5 turns)',
    code: `extends CharacterBody2D
class_name TyranidGaunt

const TILE_SIZE: int = 16
var max_hp: int = 3
var hp: int = 3
var atk: int = 1
var turns_since_last_egg: int = 0

@onready var egg_scene: PackedScene = preload("res://scenes/TyranidEgg.tscn")
var grid_pos: Vector2i = Vector2i.ZERO

func _ready() -> void:
	add_to_group("enemies")
	add_to_group("tyranids")
	grid_pos = Vector2i(int(position.x / TILE_SIZE), int(position.y / TILE_SIZE))

func on_turn_tick() -> void:
	turns_since_last_egg += 1
	# Lay egg every 5 global turns (every 15 seconds)
	if turns_since_last_egg >= 5:
		turns_since_last_egg = 0
		lay_egg()

func lay_egg() -> void:
	var adjacent_offsets = [Vector2i.UP, Vector2i.DOWN, Vector2i.LEFT, Vector2i.RIGHT]
	for offset in adjacent_offsets:
		var spawn_tile = grid_pos + offset
		if get_parent().is_tile_walkable(spawn_tile):
			var egg = egg_scene.instantiate()
			egg.position = Vector2(spawn_tile * TILE_SIZE)
			get_parent().add_child(egg)
			print("Tyranid laid a Bio-Egg at ", spawn_tile)
			break

func take_damage(dmg: int) -> void:
	hp -= dmg
	if hp <= 0:
		queue_free()
		get_parent().check_win_loss()
`
  }
];
