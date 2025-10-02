# Asciiworld Map Generator

Tool for generating the site's background image, an ASCII art world map, using [asciiworld](https://uninformativ.de/git/asciiworld)

## Workflow

### Generating a new map

1. **Experiment with options** using `map:ascii`:
   ```bash
   npm run map:ascii -- -p ham -b
   ```

2. **Generate the PNG** (with or without additional flags):
   ```bash
   npm run map:generate
   ```

3. **Review the output**:
   ```bash
   open mapgen/output/map.png
   ```

4. **Promote to production** if satisfied:
   ```bash
   cp mapgen/output/map.png src/assets/images/map.png
   ```

5. **Commit the changes**:
   ```bash
   git add src/assets/images/map.png
   git commit -m "Update map background"
   ```

## Available Commands

### `npm run map:build`

Builds the Docker image containing asciiworld, ImageMagick, and all dependencies.

**When to run:**
- First time setup / after modifying any files, need to reflect in Docker image

```bash
npm run map:build
```

### `npm run map:generate`

Generates the map PNG using the default configuration (Hammer projection with border).

**Output:** `mapgen/output/map.png`

```bash
# Generate with defaults
npm run map:generate

# Generate with additional asciiworld flags
npm run map:generate -- -s          # Add day/night shading
npm run map:generate -- -d ast       # Use astronomical dusk
```

### `npm run map:ascii`

Run asciiworld directly in your terminal to preview ASCII output and experiment with options.

**When to run:**

- Interested in generating a new bg image, want to quickly test different projections, flags, etc. before generating the final PNG.

```bash
# Preview default output in terminal
npm run map:ascii

# Try different projections
npm run map:ascii -- -p kav          # Kavrayskiy VII projection
npm run map:ascii -- -p lam          # Lambert projection

# Experiment with day/night mode
npm run map:ascii -- -s -S           # Shading without markers
```

### `npm run map:debug`

Opens a shell inside the Docker container for debugging or manual testing.

```bash
npm run map:debug

# Inside the container:
/asciiworld # ./asciiworld -p ham -b
/asciiworld # magick --version
/asciiworld # exit
```

### `npm run map:update-source`

Updates the asciiworld source code from upstream and saves the new SHA.
Idea here is to vendor in the code, so always have a copy on hand, ditch
its git repo to avoid parent repo yelling about do-you-want-to-submodule,
but still track the version of code pulled if ever a reference needed
against live source, for debugging / auditing purposes.

**When to run:**

- consider running periodically e.g. during maintenance tasks, good hygiene
to pull in updates from upstream, if any. Not a pressing concern.

**This will:**

1. Clone latest asciiworld from `https://uninformativ.de/git/asciiworld.git`
2. Copy files (excluding .git) to `mapgen/asciiworld/`
3. Update `mapgen/asciiworld-sha.txt` with the new commit SHA

```bash
npm run map:update-source
npm run map:build  # Rebuild after updating source
```

## Customization

### Current Configuration

The default map uses:
- **Dimensions:** 300x150 characters (asciiworld)
- **Projection:** Hammer (`-p ham`)
- **Border:** Yes (`-b`)
- **Colors:** No colors (`-c 0`)
- **Opacity:** 30% (`#f0fcff4D`)
- **Font:** DejaVu Sans Mono, pointsize 5

These defaults are configured in `mapgen/entrypoint.sh`.

### Modifying the Default Map

To change the default map style, edit `mapgen/entrypoint.sh`:

```bash
# Change projection (line 9)
./asciiworld -c 0 -w 300 -h 150 -p kav -b "$@"  # Kavrayskiy instead of Hammer

# Adjust opacity (line 15)
-fill "#f0fcff66"  # 40% opacity instead of 30%

# Increase font size (line 17)
-pointsize 6  # Larger characters
```

After modifying, rebuild:
```bash
npm run map:build
npm run map:generate
```